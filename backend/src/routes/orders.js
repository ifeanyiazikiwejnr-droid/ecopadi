const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Logged-in customer's own order history
router.get('/mine', requireAuth, async (req, res) => {
  const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json(orders.rows);
});

router.get('/:orderNumber', requireAuth, async (req, res) => {
  const orderResult = await pool.query('SELECT * FROM orders WHERE order_number = $1', [req.params.orderNumber]);
  const order = orderResult.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not your order.' });
  }
  const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  res.json({ ...order, items: items.rows });
});

// Guest order lookup by order number + email (no login needed)
router.post('/lookup', async (req, res) => {
  const { orderNumber, email } = req.body;
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE order_number = $1 AND (guest_email = $2 OR user_id = (SELECT id FROM users WHERE email = $2))',
    [orderNumber, (email || '').toLowerCase()]
  );
  const order = orderResult.rows[0];
  if (!order) return res.status(404).json({ error: "We couldn't find an order with those details." });
  const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  res.json({ ...order, items: items.rows });
});

module.exports = router;
