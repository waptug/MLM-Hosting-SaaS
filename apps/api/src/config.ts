import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  webPort: Number(process.env.WEB_PORT || 5174),
  databaseUrl: process.env.DATABASE_URL || '',
  storageProvider: 'postgres',
  sessionSecret: process.env.SESSION_SECRET || 'change-me'
};
