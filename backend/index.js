const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now');
    console.log('PostgreSQL connected. Server time:', rows[0].now);
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
  }
})();

app.get('/', (req, res) => {
  res.json({ message: 'Tsuuwa Backend API is running!' });
});

app.get('/db-health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});