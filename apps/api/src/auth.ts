import type { NextFunction, Request, Response } from 'express';
import { allRoles } from '../../../packages/auth/src/model.js';
import type { RoleKey, TenantContext } from '../../../packages/auth/src/model.js';
import { pool } from '@mlm-hosting-saas/database';
import { demoTenant, demoUserEmail } from './demo-data.js';

async function resolveTenantContext(req: Request): Promise<TenantContext | null> {
  const tenantSlug = String(req.header('x-tenant-slug') || demoTenant.slug).trim();
  const userEmail = String(req.header('x-user-email') || demoUserEmail).trim().toLowerCase();

  const result = await pool.query<{
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    themePreset: string;
    tenantStatus: 'draft' | 'active';
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleKey;
  }>(
    `
      SELECT
        t.id::text AS "tenantId",
        t.slug AS "tenantSlug",
        t.name AS "tenantName",
        t.theme_preset AS "themePreset",
        t.status AS "tenantStatus",
        u.id::text AS "userId",
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        tu.role_key AS role
      FROM tenant_users tu
      JOIN tenants t ON t.id = tu.tenant_id
      JOIN users u ON u.id = tu.user_id
      WHERE t.slug = $1 AND u.email = $2
      LIMIT 1
    `,
    [tenantSlug, userEmail]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    tenant: {
      id: row.tenantId,
      slug: row.tenantSlug,
      name: row.tenantName,
      themePreset: row.themePreset,
      status: row.tenantStatus
    },
    user: {
      id: row.userId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName
    },
    role: row.role
  };
}

export async function attachTenantContext(req: Request, res: Response, next: NextFunction) {
  const tenantContext = await resolveTenantContext(req);

  if (!tenantContext) {
    res.status(401).json({
      error: 'Unable to resolve tenant session.',
      acceptedHeaders: {
        tenantSlug: demoTenant.slug,
        userEmail: demoUserEmail
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
