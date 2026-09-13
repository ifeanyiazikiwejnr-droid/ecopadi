const express = require('express');
const createAsyncRouter = require('../middleware/asyncRouter');
const { pool } = require('../db');

const router = createAsyncRouter();

// Public and read-only — lets the storefront (product pages, checkout) show
// the real configured preorder minimum instead of a hardcoded number.
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM preorder_settings WHERE id = 1');
  res.json(result.rows[0]);
});

module.exports = router;
