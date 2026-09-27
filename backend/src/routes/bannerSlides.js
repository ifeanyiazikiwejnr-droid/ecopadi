const createAsyncRouter = require('../middleware/asyncRouter');
const { pool } = require('../db');

const router = createAsyncRouter();

// Public and read-only — powers the shop-page slider. Only active slides,
// in the order the admin arranged them.
router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM banner_slides WHERE active = TRUE ORDER BY position, created_at'
  );
  res.json(result.rows);
});

module.exports = router;
