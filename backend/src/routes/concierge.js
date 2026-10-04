const express = require('express');
const createAsyncRouter = require('../middleware/asyncRouter');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = createAsyncRouter();

// Lazily initialise Stripe only if a key is configured, so the server still
// boots for local/demo use before you've added real payment credentials.
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('xxx')) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// This is the free VIP program's own thing (users.is_vip) — a completely
// separate feature from the one below. VIP Concierge is a PAID monthly
// subscription that unlocks the personal-shopping-list service.
router.get('/status', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM concierge_subscriptions WHERE user_id = $1', [req.user.id]);
  const sub = result.rows[0];
  res.json({
    status: sub?.status || 'inactive',
    currentPeriodEnd: sub?.current_period_end || null,
    isActive: sub?.status === 'active',
  });
});

// Starts a Stripe Checkout session in subscription mode for the £10/month
// VIP Concierge plan. Create a recurring monthly Price in the Stripe
// dashboard first and set its id as STRIPE_CONCIERGE_PRICE_ID.
router.post('/checkout-session', requireAuth, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(501).json({ error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY in backend/.env.' });
  }
  if (!process.env.STRIPE_CONCIERGE_PRICE_ID) {
    return res.status(501).json({
      error: 'VIP Concierge pricing is not set up yet. Create a £10/month recurring Price in Stripe and set STRIPE_CONCIERGE_PRICE_ID.',
    });
  }
  try {
    const existing = await pool.query('SELECT * FROM concierge_subscriptions WHERE user_id = $1', [req.user.id]);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: existing.rows[0]?.stripe_customer_id || undefined,
      customer_email: existing.rows[0]?.stripe_customer_id ? undefined : req.user.email,
      line_items: [{ price: process.env.STRIPE_CONCIERGE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/concierge?subscribed=1`,
      cancel_url: `${process.env.FRONTEND_URL}/concierge?cancelled=1`,
      metadata: { concierge_user_id: req.user.id },
      subscription_data: { metadata: { concierge_user_id: req.user.id } },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start the VIP Concierge checkout.' });
  }
});

// Sends the customer to Stripe's hosted billing portal, where they can
// update their card or cancel the subscription themselves.
router.post('/billing-portal', requireAuth, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(501).json({ error: 'Stripe is not configured yet.' });
  const existing = await pool.query('SELECT stripe_customer_id FROM concierge_subscriptions WHERE user_id = $1', [req.user.id]);
  const customerId = existing.rows[0]?.stripe_customer_id;
  if (!customerId) return res.status(400).json({ error: 'No VIP Concierge subscription found for your account.' });
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/concierge`,
    });
    res.json({ url: portalSession.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not open the billing portal.' });
  }
});

// Submits a personal shopping list — only for active subscribers. `items`
// is whatever the customer typed in: not catalogue products, so there's no
// fixed price until an admin reviews and quotes it.
router.post('/requests', requireAuth, async (req, res) => {
  const sub = await pool.query('SELECT status FROM concierge_subscriptions WHERE user_id = $1', [req.user.id]);
  if (sub.rows[0]?.status !== 'active') {
    return res.status(403).json({ error: 'An active VIP Concierge subscription is required to submit a list.' });
  }
  const { items, notes } = req.body;
  if (!Array.isArray(items) || items.length === 0 || items.every((i) => !i?.name?.trim())) {
    return res.status(400).json({ error: 'Add at least one item to your list.' });
  }
  const cleanItems = items
    .filter((i) => i?.name?.trim())
    .map((i) => ({ name: i.name.trim(), qty: i.qty ? String(i.qty).trim() : '1', notes: i.notes?.trim() || '' }));
  const result = await pool.query(
    `INSERT INTO concierge_requests (user_id, items, notes) VALUES ($1, $2, $3) RETURNING *`,
    [req.user.id, JSON.stringify(cleanItems), notes?.trim() || null]
  );
  res.status(201).json(result.rows[0]);
});

router.get('/requests/mine', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM concierge_requests WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(result.rows);
});

module.exports = router;
