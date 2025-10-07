const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL non impostata');
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

module.exports = { pool };

