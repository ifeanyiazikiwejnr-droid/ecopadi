const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

const DELIVERY_FEE_UK_PENCE = 499;
const DELIVERY_FEE_IE_PENCE = 799;
const VIP_FREE_DELIVERY_THRESHOLD_PENCE = 5000;

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EP-${stamp}-${rand}`;
}

// Reward points are stored on users.reward_points as PENCE of accumulated
// redeemable value (not an abstract point count) — e.g. a balance of 37
// means 37p towards their next £1 discount. Rules live in reward_settings
// (admin-configurable from the dashboard) rather than being hardcoded here:
//   - a product line only earns anything once it's worth at least
//     min_item_price_pence on its own (price × quantity for that line)
//   - a qualifying line earns points_per_bracket_pence for every full
//     bracket_pence it's worth (so £100 at the £50/5p defaults earns 10p)
//   - once a customer's balance reaches redemption_threshold_pence, that
//     many pence become spendable as a discount at checkout
async function getRewardSettings(client) {
  const result = await client.query('SELECT * FROM reward_settings WHERE id = 1');
  return result.rows[0];
}

// Recomputes prices server-side from the database — never trusts prices sent
// by the client — then creates a pending order ready for payment capture.
//
// body: {
//   items: [{ productId, variantId?, quantity }],
//   discountCode?, redeemPoints?: boolean, deliveryCountry: 'United Kingdom' | 'Ireland',
//   address: { line1, line2?, city, postcode, country },
//   paymentMethod: 'stripe' | 'paypal' | 'bank_transfer',
//   guestEmail?, guestName?
// }
router.post('/', optionalAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, discountCode, redeemPoints, deliveryCountry, address, paymentMethod, guestEmail, guestName } = req.body;

    if (!req.user && !guestEmail) {
      return res.status(400).json({ error: 'Guest checkout requires an email address.' });
    }
    if (!items || !items.length) return res.status(400).json({ error: 'Your cart is empty.' });
    if (!address || !address.line1 || !address.city || !address.postcode) {
      return res.status(400).json({ error: 'A complete delivery address is required.' });
    }

    await client.query('BEGIN');

    const rewardSettings = await getRewardSettings(client);

    let subtotalPence = 0;
    const lineItems = [];

    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [item.productId]);
      const product = productResult.rows[0];
      if (!product) throw { status: 400, message: 'One of the items in your cart no longer exists.' };
      if (product.availability === 'out_of_stock') throw { status: 400, message: `${product.name} is currently out of stock.` };

      let unitPrice = product.price_pence;
      let variantLabel = null;
      if (item.variantId) {
        const variantResult = await client.query('SELECT * FROM product_variants WHERE id = $1', [item.variantId]);
        const variant = variantResult.rows[0];
        if (variant) {
          unitPrice += variant.price_delta_pence;
          variantLabel = `${variant.name}: ${variant.value}`;
        }
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineTotal = unitPrice * qty;
      subtotalPence += lineTotal;
      lineItems.push({ product, variantLabel, unitPrice, qty, lineTotal });
    }

    // Discount code
    let discountPence = 0;
    let appliedCode = null;
    if (discountCode) {
      const dResult = await client.query(
        `SELECT * FROM discount_codes WHERE code = $1 AND active = TRUE
           AND (expires_at IS NULL OR expires_at > now())
           AND (usage_limit IS NULL OR times_used < usage_limit)`,
        [discountCode.toUpperCase()]
      );
      const discount = dResult.rows[0];
      if (discount && subtotalPence >= discount.min_spend_pence) {
        discountPence =
          discount.type === 'percent'
            ? Math.round((subtotalPence * discount.value) / 100)
            : discount.value;
        appliedCode = discount.code;
        await client.query('UPDATE discount_codes SET times_used = times_used + 1 WHERE id = $1', [discount.id]);
      }
    }

    // Reward points redemption — spend in whole redemption_threshold_pence
    // units (e.g. whole £1s), based on the customer's balance BEFORE this
    // order's own new earnings are added.
    let pointsDiscountPence = 0;
    if (req.user && redeemPoints) {
      const userResult = await client.query('SELECT reward_points FROM users WHERE id = $1', [req.user.id]);
      const currentBalance = userResult.rows[0]?.reward_points || 0;
      const redeemableUnits = Math.floor(currentBalance / rewardSettings.redemption_threshold_pence);
      pointsDiscountPence = redeemableUnits * rewardSettings.redemption_threshold_pence;
      // Cap so points can't discount more than the subtotal itself
      pointsDiscountPence = Math.min(pointsDiscountPence, Math.max(0, subtotalPence - discountPence));
      if (pointsDiscountPence > 0) {
        await client.query('UPDATE users SET reward_points = reward_points - $1 WHERE id = $2', [pointsDiscountPence, req.user.id]);
      }
    }

    // Delivery fee — VIP customers get free delivery on orders £50+
    const isIreland = (deliveryCountry || 'United Kingdom').toLowerCase().includes('ireland');
    let deliveryFeePence = isIreland ? DELIVERY_FEE_IE_PENCE : DELIVERY_FEE_UK_PENCE;
    if (req.user && req.user.is_vip && subtotalPence - discountPence >= VIP_FREE_DELIVERY_THRESHOLD_PENCE) {
      deliveryFeePence = 0;
    }

    const totalPence = Math.max(0, subtotalPence - discountPence - pointsDiscountPence) + deliveryFeePence;
    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders
        (order_number, user_id, guest_email, guest_name, status, payment_method,
         subtotal_pence, discount_pence, discount_code, points_discount_pence, delivery_fee_pence, total_pence,
         delivery_address, delivery_country)
       VALUES ($1,$2,$3,$4,'pending',$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        orderNumber,
        req.user ? req.user.id : null,
        req.user ? null : guestEmail,
        req.user ? null : guestName,
        paymentMethod,
        subtotalPence,
        discountPence,
        appliedCode,
        pointsDiscountPence,
        deliveryFeePence,
        totalPence,
        JSON.stringify(address),
        isIreland ? 'Ireland' : 'United Kingdom',
      ]
    );
    const order = orderResult.rows[0];

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, variant_label, unit_price_pence, quantity, line_total_pence)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.id, li.product.id, li.product.name, li.variantLabel, li.unitPrice, li.qty, li.lineTotal]
      );
    }

    // Reward points earned on THIS order — evaluated against the whole
    // order subtotal, not per individual product line. The order must be
    // worth at least min_item_price_pence in total to earn anything, and
    // only whole brackets count.
    if (req.user) {
      let earnedPence = 0;
      if (subtotalPence >= rewardSettings.min_item_price_pence) {
        earnedPence = Math.floor(subtotalPence / rewardSettings.bracket_pence) * rewardSettings.points_per_bracket_pence;
      }
      if (earnedPence > 0) {
        await client.query('UPDATE users SET reward_points = reward_points + $1 WHERE id = $2', [earnedPence, req.user.id]);
      }
    }

    await client.query('COMMIT');

    // For bank transfer orders, the payment details are returned ONLY in this
    // authenticated response to the customer who just placed the order — never
    // rendered on any public page. See backend/.env.example for why.
    const bankDetails =
      paymentMethod === 'bank_transfer'
        ? {
            accountName: process.env.BANK_TRANSFER_ACCOUNT_NAME,
            accountNumber: process.env.BANK_TRANSFER_ACC_NO,
            sortCode: process.env.BANK_TRANSFER_SORT_CODE,
            reference: order.order_number,
          }
        : undefined;

    res.json({ order, bankDetails });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Checkout failed. Please try again.' });
  } finally {
    client.release();
  }
});

module.exports = router;
