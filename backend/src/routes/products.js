const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/products?category=Spices+%26+Seasoning&search=suya
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const clauses = [];
  const params = [];

  if (category) {
    params.push(category);
    clauses.push(`category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    clauses.push(`name ILIKE $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT p.*,
       COALESCE(AVG(r.rating), 0)::float AS avg_rating,
       COUNT(r.id)::int AS review_count
     FROM products p
     LEFT JOIN reviews r ON r.product_id = p.id
     ${where}
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    params
  );
  res.json(result.rows);
});

router.get('/:slug', async (req, res) => {
  const productResult = await pool.query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
  const product = productResult.rows[0];
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const variants = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]);
  const reviews = await pool.query(
    'SELECT id, reviewer_name, rating, comment, created_at FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
    [product.id]
  );
  const images = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY position', [product.id]);
  res.json({ ...product, variants: variants.rows, reviews: reviews.rows, images: images.rows });
});

module.exports = router;
