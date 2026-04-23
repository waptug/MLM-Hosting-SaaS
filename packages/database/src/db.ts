import { Pool } from 'pg';
import { databaseConfig } from './config.js';

export const pool = new Pool({
  connectionString: databaseConfig.databaseUrl
});

export async function closePool() {
  await pool.end();
}

