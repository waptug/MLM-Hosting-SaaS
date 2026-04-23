import type { NextFunction, Request, Response } from 'express';
import { allRoles } from '../../../packages/auth/src/model.js';
import type { RoleKey, TenantContext } from '../../../packages/auth/src/model.js';
import { demoMemberships, demoTenant, demoUsers } from './demo-data.js';

function resolveTenantContext(req: Request): TenantContext | null {
  const tenantSlug = String(req.header('x-tenant-slug') || demoTenant.slug).trim();
  const userEmail = String(req.header('x-user-email') || 'owner@example.com').trim().toLowerCase();

  if (tenantSlug !== demoTenant.slug) return null;

  const user = demoUsers.find((entry) => entry.email === userEmail);
  const membership = demoMemberships.find(
    (entry) => entry.tenantSlug === tenantSlug && entry.userEmail === userEmail
  );

  if (!user || !membership) return null;

  return {
    tenant: demoTenant,
    user,
    role: membership.role
  };
}

export function attachTenantContext(req: Request, res: Response, next: NextFunction) {
  const tenantContext = resolveTenantContext(req);

  if (!tenantContext) {
    res.status(401).json({
      error: 'Unable to resolve tenant session.',
      acceptedHeaders: {
        tenantSlug: demoTenant.slug,
        userEmail: demoUsers.map((user) => user.email)
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
