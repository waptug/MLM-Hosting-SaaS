import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

export const sessionCookieName = 'mlm_hosting_session';

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1
  });

  return ['scrypt', '16384', '8', '1', salt, derivedKey.toString('hex')].join('$');
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, n, r, p, salt, expectedHash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !expectedHash) return false;

  const derivedKey = scryptSync(password, salt, expectedHash.length / 2, {
    N: Number(n),
    r: Number(r),
    p: Number(p)
  });

  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  if (expectedBuffer.length !== derivedKey.length) return false;

  return timingSafeEqual(expectedBuffer, derivedKey);
}

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function parseCookies(cookieHeader: string | undefined) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const pair of cookieHeader.split(';')) {
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex < 0) continue;
    const key = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }

  return cookies;
}
