const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Lazily initialise Stripe only if a key is configured, so the server still
// boots for local/demo use before you've added real payment credentials.
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('xxx')) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Creates a Stripe Checkout Session for an existing pending order.
// Stripe Checkout natively supports Visa/Mastercard and Apple Pay — no
// separate Apple Pay integration is needed once your Stripe account and
// domain are verified in the Stripe dashboard.
router.post('/stripe/create-session', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(501).json({
      error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY in backend/.env — see README for setup steps.',
    });
  }
  try {
    const { orderNumber } = req.body;
    const orderResult = await pool.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'], // Apple Pay appears automatically on supported card element/Checkout
      line_items: items.rows.map((i) => ({
        price_data: {
          currency: 'gbp',
          product_data: { name: i.variant_label ? `${i.product_name} (${i.variant_label})` : i.product_name },
          unit_amount: i.unit_price_pence,
        },
        quantity: i.quantity,
      })),
      shipping_options: [
        { shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: order.delivery_fee_pence, currency: 'gbp' },
            display_name: 'Delivery',
          } },
      ],
      success_url: `${process.env.FRONTEND_URL}/order-confirmation?order=${order.order_number}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=1`,
      metadata: { order_number: order.order_number },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start Stripe checkout.' });
  }
});

// Stripe calls this when payment completes. Configure the webhook URL
// (https://your-api.onrender.com/api/payments/stripe/webhook) in the Stripe
// dashboard and set STRIPE_WEBHOOK_SECRET.
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(501).send('Stripe not configured');
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await pool.query(
      `UPDATE orders SET status = 'paid', payment_reference = $1 WHERE order_number = $2`,
      [session.id, session.metadata.order_number]
    );
  }
  res.json({ received: true });
});

// PayPal: create + capture order using the PayPal REST API.
// This is a working shape against PayPal's v2 orders API — swap in your
// real PAYPAL_CLIENT_ID / SECRET (and PAYPAL_ENV=live when ready) to activate it.
async function paypalAccessToken() {
  const base = process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const resp = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await resp.json();
  return { token: data.access_token, base };
}

router.post('/paypal/create-order', async (req, res) => {
  if (!process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID.includes('your_paypal')) {
    return res.status(501).json({ error: 'PayPal is not configured yet. Add PAYPAL_CLIENT_ID/SECRET in backend/.env.' });
  }
  try {
    const { orderNumber } = req.body;
    const orderResult = await pool.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const { token, base } = await paypalAccessToken();
    const ppResp = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          { amount: { currency_code: 'GBP', value: (order.total_pence / 100).toFixed(2) },
            reference_id: order.order_number },
        ],
      }),
    });
    const ppOrder = await ppResp.json();
    res.json(ppOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start PayPal checkout.' });
  }
});

router.post('/paypal/capture-order/:paypalOrderId', async (req, res) => {
  try {
    const { token, base } = await paypalAccessToken();
    const resp = await fetch(`${base}/v2/checkout/orders/${req.params.paypalOrderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await resp.json();
    if (data.status === 'COMPLETED') {
      const orderNumber = data.purchase_units[0].reference_id;
      await pool.query(`UPDATE orders SET status = 'paid', payment_reference = $1 WHERE order_number = $2`, [
        data.id,
        orderNumber,
      ]);
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not capture PayPal payment.' });
  }
});

module.exports = router;
