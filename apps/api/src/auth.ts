import type { NextFunction, Request, Response } from 'express';
import { allRoles } from '../../../packages/auth/src/model.js';
import type { RoleKey, TenantContext } from '../../../packages/auth/src/model.js';
import { resolveTenantContextByEmail, resolveTenantContextBySessionToken } from './auth-state.js';
import { parseCookies, sessionCookieName } from './auth-security.js';
import { demoTenant } from './demo-data.js';

async function resolveTenantContext(req: Request): Promise<TenantContext | null> {
  const cookies = parseCookies(req.header('cookie'));
  const sessionToken = cookies[sessionCookieName];
  if (sessionToken) {
    const sessionContext = await resolveTenantContextBySessionToken(sessionToken);
    if (sessionContext) return sessionContext;
  }

  const tenantSlug = String(req.header('x-tenant-slug') || '').trim();
  const userEmail = String(req.header('x-user-email') || '').trim().toLowerCase();
  if (!tenantSlug || !userEmail) return null;

  return resolveTenantContextByEmail(tenantSlug, userEmail);
}

export async function attachTenantContext(req: Request, res: Response, next: NextFunction) {
  const tenantContext = await resolveTenantContext(req);

  if (!tenantContext) {
    res.status(401).json({
      error: 'Unable to resolve tenant session.',
      acceptedHeaders: {
        tenantSlug: demoTenant.slug,
        userEmail: 'owner@example.com'
      }
    });
    return;
  }

  req.tenantContext = tenantContext;
  next();
}

export function requireRole(allowedRoles: RoleKey[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentRole = req.tenantContext?.role;

    if (!currentRole || !allRoles.includes(currentRole)) {
      res.status(401).json({ error: 'No authenticated tenant session.' });
      return;
    }

    if (!allowedRoles.includes(currentRole)) {
      res.status(403).json({
        error: 'Insufficient role for this action.',
        allowedRoles,
        currentRole
      });
      return;
    }

    next();
  };
}
