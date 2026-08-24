const { Pool } = require('pg');
require('dotenv').config();

// Hosted Postgres providers (Neon, Render, Supabase, etc.) require SSL even
// when you're connecting from your own laptop during local development —
// it's not just a "production" thing. Only skip SSL for a real local
// Postgres install (localhost / 127.0.0.1).
const connectionString = process.env.DATABASE_URL || '';
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

module.exports = { pool };
