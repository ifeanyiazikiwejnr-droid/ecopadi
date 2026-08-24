const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Register a new account. VIP signup is free — the only thing "VIP" changes
// is is_vip = true, which unlocks free delivery over £50 + reward points.
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, wantsVip } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: 'An account with that email already exists.' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, is_vip, vip_since)
       VALUES ($1,$2,$3,$4,$5, CASE WHEN $5 THEN now() ELSE NULL END)
       RETURNING id, email, full_name, role, is_vip, reward_points`,
      [email.toLowerCase(), hash, fullName, phone || null, !!wantsVip]
    );
    const user = result.rows[0];
    res.json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [(email || '').toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    const { password_hash, ...safeUser } = user;
    res.json({ token: signToken(user), user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not log in.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, full_name, phone, role, is_vip, vip_since, reward_points, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  res.json(result.rows[0]);
});

// Join the free VIP program from an already-logged-in account
router.post('/vip/join', requireAuth, async (req, res) => {
  const result = await pool.query(
    `UPDATE users SET is_vip = TRUE, vip_since = COALESCE(vip_since, now()) WHERE id = $1
     RETURNING id, email, full_name, is_vip, vip_since, reward_points`,
    [req.user.id]
  );
  res.json(result.rows[0]);
});

module.exports = router;
