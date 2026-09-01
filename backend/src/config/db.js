import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Pemakaian: const { rows } = await query('SELECT * FROM owners WHERE phone = $1', [phone]);
export async function query(text, params) {
  return pool.query(text, params);
}
