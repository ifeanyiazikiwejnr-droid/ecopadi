const express = require('express');
const { pool } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { upload, uploadBufferToCloudinary, cloudinary } = require('../middleware/upload');

const router = express.Router();
router.use(requireAdmin); // every route below requires role = 'admin'

// Keeps products.image_url (used everywhere for quick thumbnail lookups,
// e.g. shop grid) in sync with whichever image is currently flagged as the
// thumbnail in product_images.
async function syncThumbnail(productId) {
  const result = await pool.query(
    'SELECT url FROM product_images WHERE product_id = $1 AND is_thumbnail = TRUE LIMIT 1',
    [productId]
  );
  await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [result.rows[0]?.url || null, productId]);
}

// --- Dashboard summary ---
router.get('/summary', async (req, res) => {
  const [orders, revenue, products, customers] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM orders WHERE status != 'cancelled'`),
    pool.query(`SELECT COALESCE(SUM(total_pence),0)::bigint AS total FROM orders WHERE status = 'paid'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM products`),
    pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'`),
  ]);
  res.json({
    orderCount: orders.rows[0].count,
    revenuePence: Number(revenue.rows[0].total),
    productCount: products.rows[0].count,
    customerCount: customers.rows[0].count,
  });
});

// --- Products CRUD ---
const VALID_AVAILABILITY = ['in_stock', 'out_of_stock', 'preorder'];

router.post('/products', async (req, res) => {
  const { sku, name, slug, category, description, pricePence, compareAtPricePence, imageUrl, stockQty, availability, availabilityNote } = req.body;
  const status = VALID_AVAILABILITY.includes(availability) ? availability : 'in_stock';
  const result = await pool.query(
    `INSERT INTO products (sku, name, slug, category, description, price_pence, compare_at_price_pence, image_url, stock_qty, is_placeholder, availability, availability_note, in_stock)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, FALSE, $10, $11, $12) RETURNING *`,
    [sku, name, slug, category, description, pricePence, compareAtPricePence || null, imageUrl || null, stockQty || 0, status, availabilityNote || null, status !== 'out_of_stock']
  );
  res.json(result.rows[0]);
});

router.put('/products/:id', async (req, res) => {
  const { name, category, description, pricePence, compareAtPricePence, imageUrl, stockQty, availability, availabilityNote } = req.body;
  const status = VALID_AVAILABILITY.includes(availability) ? availability : 'in_stock';
  const result = await pool.query(
    `UPDATE products SET name=$1, category=$2, description=$3, price_pence=$4,
       compare_at_price_pence=$5, image_url=$6, stock_qty=$7, availability=$8, availability_note=$9,
       in_stock=$10, is_placeholder=FALSE
     WHERE id=$11 RETURNING *`,
    [name, category, description, pricePence, compareAtPricePence || null, imageUrl, stockQty, status, availabilityNote || null, status !== 'out_of_stock', req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Product not found.' });
  res.json(result.rows[0]);
});

router.delete('/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ deleted: true });
});

// --- Orders ---
router.get('/orders', async (req, res) => {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
  res.json(result.rows);
});

router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  res.json(result.rows[0]);
});

// --- Discount codes ---
router.get('/discounts', async (req, res) => {
  const result = await pool.query('SELECT * FROM discount_codes ORDER BY code');
  res.json(result.rows);
});

router.post('/discounts', async (req, res) => {
  const { code, type, value, minSpendPence, expiresAt, usageLimit } = req.body;
  const result = await pool.query(
    `INSERT INTO discount_codes (code, type, value, min_spend_pence, expires_at, usage_limit)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [code.toUpperCase(), type, value, minSpendPence || 0, expiresAt || null, usageLimit || null]
  );
  res.json(result.rows[0]);
});

router.put('/discounts/:id', async (req, res) => {
  const { active } = req.body;
  const result = await pool.query('UPDATE discount_codes SET active = $1 WHERE id = $2 RETURNING *', [active, req.params.id]);
  res.json(result.rows[0]);
});

// --- Product images ---

// Upload one or more images for a product. Field name must be "images".
// The first image uploaded becomes the thumbnail automatically. Files are
// pushed straight to Cloudinary (see middleware/upload.js) so they survive
// backend redeploys.
router.post('/products/:id/images', upload.array('images', 8), async (req, res) => {
  try {
    const { id } = req.params;
    const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (!productResult.rows[0]) return res.status(404).json({ error: 'Product not found.' });

    const existingCount = await pool.query('SELECT COUNT(*)::int AS count FROM product_images WHERE product_id = $1', [id]);
    let nextPosition = existingCount.rows[0].count;
    let thumbnailAssigned = nextPosition > 0
      ? (await pool.query('SELECT id FROM product_images WHERE product_id = $1 AND is_thumbnail = TRUE', [id])).rows.length > 0
      : false;

    const inserted = [];
    for (const file of req.files) {
      const cloudinaryResult = await uploadBufferToCloudinary(file.buffer);
      const makeThumbnail = !thumbnailAssigned;
      if (makeThumbnail) thumbnailAssigned = true;
      const result = await pool.query(
        `INSERT INTO product_images (product_id, url, external_id, is_thumbnail, position) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [id, cloudinaryResult.secure_url, cloudinaryResult.public_id, makeThumbnail, nextPosition]
      );
      inserted.push(result.rows[0]);
      nextPosition += 1;
    }
    await syncThumbnail(id);
    res.json(inserted);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Upload failed.' });
  }
});

router.get('/products/:id/images', async (req, res) => {
  const result = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY position', [req.params.id]);
  res.json(result.rows);
});

// Mark a specific image as the thumbnail (unsets any previous thumbnail).
router.put('/products/:id/images/:imageId/thumbnail', async (req, res) => {
  const { id, imageId } = req.params;
  const target = await pool.query('SELECT id FROM product_images WHERE id = $1 AND product_id = $2', [imageId, id]);
  if (!target.rows[0]) return res.status(404).json({ error: 'Image not found.' });
  await pool.query('UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = $1', [id]);
  await pool.query('UPDATE product_images SET is_thumbnail = TRUE WHERE id = $1 AND product_id = $2', [imageId, id]);
  await syncThumbnail(id);
  const result = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY position', [id]);
  res.json(result.rows);
});

router.delete('/products/:id/images/:imageId', async (req, res) => {
  const { id, imageId } = req.params;
  const imageResult = await pool.query('SELECT * FROM product_images WHERE id = $1 AND product_id = $2', [imageId, id]);
  const image = imageResult.rows[0];
  if (!image) return res.status(404).json({ error: 'Image not found.' });

  await pool.query('DELETE FROM product_images WHERE id = $1', [imageId]);

  // Clean up the file on Cloudinary too (best-effort — don't fail the request if this errors)
  if (image.external_id) {
    cloudinary.uploader.destroy(image.external_id).catch(() => {});
  }

  // If we just deleted the thumbnail, promote the next remaining image
  if (image.is_thumbnail) {
    const remaining = await pool.query('SELECT id FROM product_images WHERE product_id = $1 ORDER BY position LIMIT 1', [id]);
    if (remaining.rows[0]) {
      await pool.query('UPDATE product_images SET is_thumbnail = TRUE WHERE id = $1', [remaining.rows[0].id]);
    }
  }
  await syncThumbnail(id);
  res.json({ deleted: true });
});

// --- Product variants (e.g. hair extension types, sizes) ---
router.get('/products/:id/variants', async (req, res) => {
  const result = await pool.query('SELECT * FROM product_variants WHERE product_id = $1 ORDER BY name, value', [req.params.id]);
  res.json(result.rows);
});

router.post('/products/:id/variants', async (req, res) => {
  const { id } = req.params;
  const { name, value, priceDeltaPence } = req.body;
  if (!name || !value) return res.status(400).json({ error: 'Both a name (e.g. "Type") and a value (e.g. "Straight 18\\"") are required.' });
  const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
  if (!productResult.rows[0]) return res.status(404).json({ error: 'Product not found.' });
  const result = await pool.query(
    `INSERT INTO product_variants (product_id, name, value, price_delta_pence) VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, name, value, Number(priceDeltaPence) || 0]
  );
  res.json(result.rows[0]);
});

router.delete('/products/:id/variants/:variantId', async (req, res) => {
  const { id, variantId } = req.params;
  const result = await pool.query('DELETE FROM product_variants WHERE id = $1 AND product_id = $2 RETURNING id', [variantId, id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Variant not found.' });
  res.json({ deleted: true });
});

// --- Preorder fulfilment report ---
// For every product currently marked "preorder", shows the total quantity
// ordered so far and exactly who ordered it (with delivery address), so
// once stock arrives you know how many units you need and who to ship them to.
router.get('/preorders', async (req, res) => {
  const result = await pool.query(`
    SELECT
      p.id AS product_id, p.name AS product_name, p.sku,
      oi.id AS order_item_id, oi.quantity, oi.variant_label,
      o.order_number, o.status, o.created_at,
      o.guest_name, o.guest_email, o.delivery_address, o.delivery_country,
      u.full_name AS user_name, u.email AS user_email
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN users u ON u.id = o.user_id
    WHERE p.availability = 'preorder'
      AND o.status NOT IN ('cancelled', 'refunded')
    ORDER BY p.name, o.created_at
  `);

  const byProduct = new Map();
  for (const row of result.rows) {
    if (!byProduct.has(row.product_id)) {
      byProduct.set(row.product_id, {
        productId: row.product_id,
        productName: row.product_name,
        sku: row.sku,
        totalQuantity: 0,
        orders: [],
      });
    }
    const entry = byProduct.get(row.product_id);
    entry.totalQuantity += row.quantity;
    entry.orders.push({
      orderNumber: row.order_number,
      status: row.status,
      orderDate: row.created_at,
      quantity: row.quantity,
      variantLabel: row.variant_label,
      customerName: row.user_name || row.guest_name,
      customerEmail: row.user_email || row.guest_email,
      address: row.delivery_address,
      deliveryCountry: row.delivery_country,
    });
  }

  res.json(Array.from(byProduct.values()));
});

// --- Customers (read-only list) ---
router.get('/customers', async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, full_name, is_vip, reward_points, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
    ['customer']
  );
  res.json(result.rows);
});

module.exports = router;
