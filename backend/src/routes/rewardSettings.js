const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Public and read-only — lets the storefront (checkout page, FAQ) always
// reflect whatever rules the admin has actually configured, instead of
// hardcoding numbers that could drift out of sync.
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM reward_settings WHERE id = 1');
  res.json(result.rows[0]);
});

module.exports = router;
