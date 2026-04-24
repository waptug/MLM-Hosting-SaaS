import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

function parseBoolean(value: string | undefined, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function parseSameSite(value: string | undefined) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'none' || normalized === 'strict' || normalized === 'lax') {
    return normalized;
  }
  return 'lax';
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  webPort: Number(process.env.WEB_PORT || 5174),
  databaseUrl: process.env.DATABASE_URL || '',
  storageProvider: 'postgres',
  sessionSecret: process.env.SESSION_SECRET || 'change-me',
  sessionCookieSecure: parseBoolean(process.env.SESSION_COOKIE_SECURE, process.env.NODE_ENV === 'production'),
  sessionCookieSameSite: parseSameSite(process.env.SESSION_COOKIE_SAME_SITE),
  sessionCookieDomain: String(process.env.SESSION_COOKIE_DOMAIN || '').trim() || undefined,
  sessionCookieMaxAgeDays: Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS || 14)
};
