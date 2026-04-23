import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const databaseConfig = {
  databaseUrl: process.env.DATABASE_URL || '',
  migrationTableName: 'schema_migrations'
};

if (!databaseConfig.databaseUrl) {
  throw new Error('DATABASE_URL is required for database commands.');
}

