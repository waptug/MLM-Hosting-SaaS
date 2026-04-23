import cors from 'cors';
import express from 'express';
import { allRoles } from '../../../packages/auth/src/model.js';
import { attachTenantContext, requireRole } from './auth.js';
import { config } from './config.js';
import { demoMemberships, demoTenant, demoUsers } from './demo-data.js';

type BootstrapTenant = {
  slug: string;
  name: string;
  themePreset: string;
  status: 'draft' | 'active';
  ownerEmail: string;
};

const bootstrapTenant: BootstrapTenant = {
  slug: demoTenant.slug,
  name: demoTenant.name,
  themePreset: demoTenant.themePreset,
  status: demoTenant.status,
  ownerEmail: 'owner@example.com'
};

const app = express();

app.use(
  cors({
    origin: [`http://127.0.0.1:${config.webPort}`, `http://localhost:${config.webPort}`]
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    app: 'mlm-hosting-saas-api',
    env: config.nodeEnv
  });
});

app.get('/api/bootstrap', (_req, res) => {
  res.json({
    tenant: bootstrapTenant,
    capabilities: {
      multiTenant: true,
      whiteLabel: true,
      payouts: 'planned',
      commissionEngine: 'planned'
    },
    nextBuildTargets: [
      'tenant tables and migrations',
      'user auth and invitations',
      'role-based access',
      'tenant-scoped API middleware'
    ]
  });
});

app.get('/api/roles', (_req, res) => {
  res.json({ roles: allRoles });
});

app.get('/api/session', attachTenantContext, (req, res) => {
  res.json({
    tenant: req.tenantContext?.tenant,
    user: req.tenantContext?.user,
    role: req.tenantContext?.role
  });
});

app.get('/api/tenant-context', attachTenantContext, (req, res) => {
  res.json({
    tenant: req.tenantContext?.tenant,
    role: req.tenantContext?.role,
    capabilities: {
      canManageUsers: ['tenant_owner', 'tenant_manager'].includes(req.tenantContext?.role || ''),
      canApprovePayouts: ['tenant_owner', 'finance_manager'].includes(req.tenantContext?.role || ''),
      canRecruit: ['tenant_owner', 'tenant_manager', 'recruiter'].includes(req.tenantContext?.role || '')
    }
  });
});

app.get(
  '/api/admin/tenant-users',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  (req, res) => {
    const users = demoMemberships
      .filter((membership) => membership.tenantSlug === req.tenantContext?.tenant.slug)
      .map((membership) => {
        const user = demoUsers.find((entry) => entry.email === membership.userEmail);
        return {
          ...user,
          role: membership.role
        };
      });

    res.json({ users });
  }
);

app.listen(config.port, '127.0.0.1', () => {
  console.log(`MLM Hosting SaaS API listening on http://127.0.0.1:${config.port}`);
});
