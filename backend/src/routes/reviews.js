const express = require('express');
const { pool } = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, async (req, res) => {
  const { productId, rating, comment, reviewerName } = req.body;
  if (!productId || !rating) return res.status(400).json({ error: 'productId and rating are required.' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

  const name = req.user ? req.user.full_name : (reviewerName || 'Anonymous');
  const result = await pool.query(
    `INSERT INTO reviews (product_id, user_id, reviewer_name, rating, comment)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [productId, req.user ? req.user.id : null, name, rating, comment || null]
  );
  res.json(result.rows[0]);
});

module.exports = router;
