const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/discounts/validate  { code, subtotalPence }
router.post('/validate', async (req, res) => {
  const { code, subtotalPence } = req.body;
  if (!code) return res.status(400).json({ error: 'Enter a discount code.' });

  const result = await pool.query(
    `SELECT * FROM discount_codes WHERE code = $1 AND active = TRUE
       AND (expires_at IS NULL OR expires_at > now())
       AND (usage_limit IS NULL OR times_used < usage_limit)`,
    [code.toUpperCase()]
  );
  const discount = result.rows[0];
  if (!discount) return res.status(404).json({ error: 'That code is invalid or has expired.' });
  if (subtotalPence < discount.min_spend_pence) {
    return res.status(400).json({
      error: `This code needs a minimum spend of £${(discount.min_spend_pence / 100).toFixed(2)}.`,
    });
  }

  const discountPence =
    discount.type === 'percent'
      ? Math.round((subtotalPence * discount.value) / 100)
      : discount.value;

  res.json({ code: discount.code, type: discount.type, value: discount.value, discountPence });
});

module.exports = router;
