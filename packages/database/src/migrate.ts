import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closePool, pool } from './db.js';
import { databaseConfig } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '..');

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${databaseConfig.migrationTableName} (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function appliedMigrations() {
  const result = await pool.query<{ filename: string }>(
    `SELECT filename FROM ${databaseConfig.migrationTableName} ORDER BY filename`
  );
  return new Set(result.rows.map((row) => row.filename));
}

async function migrationFiles() {
  const entries = await fs.readdir(migrationsDir);
  return entries.filter((entry) => entry.endsWith('.sql')).sort();
}

async function applyMigration(filename: string) {
  const fullPath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(fullPath, 'utf8');
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query(
      `INSERT INTO ${databaseConfig.migrationTableName} (filename) VALUES ($1)`,
      [filename]
    );
    await pool.query('COMMIT');
    console.log(`Applied migration ${filename}`);
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  await ensureMigrationTable();
  const [files, applied] = await Promise.all([migrationFiles(), appliedMigrations()]);
  const pending = files.filter((filename) => !applied.has(filename));

  if (!pending.length) {
    console.log('No pending migrations.');
    return;
  }

  for (const filename of pending) {
    await applyMigration(filename);
  }
}

main()
  .catch((error) => {
    console.error(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });

