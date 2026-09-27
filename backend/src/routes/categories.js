const createAsyncRouter = require('../middleware/asyncRouter');
const { pool } = require('../db');

const router = createAsyncRouter();

// Public and read-only — powers the Shop page filter and the category
// dropdowns in the admin product forms, so both always reflect whatever
// the admin has actually configured.
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY position, name');
  res.json(result.rows);
});

module.exports = router;
