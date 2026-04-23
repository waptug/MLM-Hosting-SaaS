import cors from 'cors';
import express from 'express';
import { allRoles } from '../../../packages/auth/src/model.js';
import { tenantRoles } from '../../../packages/auth/src/model.js';
import { attachTenantContext, requireRole } from './auth.js';
import { config } from './config.js';
import { demoTenant } from './demo-data.js';
import {
  addCustomer,
  addMember,
  addOrder,
  addSalesGroup,
  addTenantUser,
  getTenantSetup,
  hasCustomer,
  hasMember,
  hasProduct,
  listCustomers,
  listMembers,
  listOrders,
  listProducts,
  listSalesGroups,
  listTenantUsers,
  updateTenantSetup
} from './state.js';

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
  ownerEmail: getTenantSetup().ownerEmail
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
  const setup = getTenantSetup();
  res.json({
    tenant: { ...bootstrapTenant, ...setup },
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

app.get(
  '/api/admin/onboarding',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  (_req, res) => {
    res.json({ setup: getTenantSetup() });
  }
);

app.put(
  '/api/admin/onboarding',
  attachTenantContext,
  requireRole(['tenant_owner']),
  (req, res) => {
    const payload = req.body || {};
    const nextSetup = updateTenantSetup({
      slug: String(payload.slug || '').trim() || getTenantSetup().slug,
      name: String(payload.name || '').trim() || getTenantSetup().name,
      themePreset: String(payload.themePreset || '').trim() || getTenantSetup().themePreset,
      status: payload.status === 'active' ? 'active' : 'draft',
      ownerEmail: String(payload.ownerEmail || '').trim() || getTenantSetup().ownerEmail,
      supportEmail: String(payload.supportEmail || '').trim() || getTenantSetup().supportEmail,
      brandLabel: String(payload.brandLabel || '').trim() || getTenantSetup().brandLabel,
      primaryDomain: String(payload.primaryDomain || '').trim() || getTenantSetup().primaryDomain
    });

    res.json({ setup: nextSetup });
  }
);

app.get('/api/roles', (_req, res) => {
  res.json({ roles: allRoles });
});

app.get('/api/tenant-roles', (_req, res) => {
  res.json({ roles: tenantRoles });
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
  (_req, res) => {
    res.json({ users: listTenantUsers() });
  }
);

app.post(
  '/api/admin/tenant-users',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  (req, res) => {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const role = String(body.role || '').trim();

    if (!email || !firstName || !lastName || !tenantRoles.includes(role as (typeof tenantRoles)[number])) {
      res.status(400).json({
        error: 'Email, first name, last name, and a valid tenant role are required.'
      });
      return;
    }

    const user = addTenantUser({
      email,
      firstName,
      lastName,
      role: role as (typeof tenantRoles)[number]
    });

    res.status(201).json({ user });
  }
);

app.get(
  '/api/admin/sales-groups',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter']),
  (_req, res) => {
    res.json({ salesGroups: listSalesGroups() });
  }
);

app.post(
  '/api/admin/sales-groups',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  (req, res) => {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const code = String(body.code || '').trim().toUpperCase();
    const region = String(body.region || '').trim();
    const managerEmail = String(body.managerEmail || '').trim().toLowerCase();
    const status = body.status === 'active' ? 'active' : 'draft';
    const notes = String(body.notes || '').trim();

    if (!name || !code || !managerEmail) {
      res.status(400).json({
        error: 'Name, code, and manager email are required.'
      });
      return;
    }

    const salesGroup = addSalesGroup({
      name,
      code,
      region,
      managerEmail,
      status,
      notes
    });

    res.status(201).json({ salesGroup });
  }
);

app.get(
  '/api/admin/members',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter']),
  (_req, res) => {
    res.json({ members: listMembers() });
  }
);

app.post(
  '/api/admin/members',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter']),
  (req, res) => {
    const body = req.body || {};
    const salesGroupId = String(body.salesGroupId || '').trim();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const roleTitle = String(body.roleTitle || '').trim();
    const status = ['prospect', 'active', 'paused'].includes(String(body.status || ''))
      ? (body.status as 'prospect' | 'active' | 'paused')
      : 'prospect';
    const sponsorMemberId = String(body.sponsorMemberId || '').trim() || null;

    if (!salesGroupId || !firstName || !lastName || !email) {
      res.status(400).json({
        error: 'Sales group, first name, last name, and email are required.'
      });
      return;
    }

    const member = addMember({
      salesGroupId,
      firstName,
      lastName,
      email,
      roleTitle,
      status,
      sponsorMemberId
    });

    res.status(201).json({ member });
  }
);

app.get(
  '/api/admin/customers',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  (_req, res) => {
    res.json({ customers: listCustomers() });
  }
);

app.post(
  '/api/admin/customers',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  (req, res) => {
    const body = req.body || {};
    const ownerMemberId = String(body.ownerMemberId || '').trim();
    const companyName = String(body.companyName || '').trim();
    const contactName = String(body.contactName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const status = ['lead', 'active', 'past_due', 'churned'].includes(String(body.status || ''))
      ? (body.status as 'lead' | 'active' | 'past_due' | 'churned')
      : 'lead';
    const monthlyRevenue = Number(body.monthlyRevenue || 0);
    const source = String(body.source || '').trim();
    const notes = String(body.notes || '').trim();

    if (!ownerMemberId || !companyName || !contactName || !email) {
      res.status(400).json({
        error: 'Owner member, company name, contact name, and email are required.'
      });
      return;
    }

    if (!hasMember(ownerMemberId)) {
      res.status(400).json({
        error: 'Owner member must match an existing member in this tenant.'
      });
      return;
    }

    const customer = addCustomer({
      ownerMemberId,
      companyName,
      contactName,
      email,
      phone,
      status,
      monthlyRevenue: Number.isFinite(monthlyRevenue) ? monthlyRevenue : 0,
      source,
      notes
    });

    res.status(201).json({ customer });
  }
);

app.get(
  '/api/admin/products',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  (_req, res) => {
    res.json({ products: listProducts() });
  }
);

app.get(
  '/api/admin/orders',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  (_req, res) => {
    res.json({ orders: listOrders() });
  }
);

app.post(
  '/api/admin/orders',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  (req, res) => {
    const body = req.body || {};
    const customerId = String(body.customerId || '').trim();
    const productId = String(body.productId || '').trim();
    const sellingMemberId = String(body.sellingMemberId || '').trim();
    const quantity = Math.max(1, Number(body.quantity || 1));
    const unitPrice = Number(body.unitPrice || 0);
    const billingCycle = body.billingCycle === 'annual' ? 'annual' : 'monthly';
    const status = ['pending', 'active', 'cancelled'].includes(String(body.status || ''))
      ? (body.status as 'pending' | 'active' | 'cancelled')
      : 'pending';
    const placedAt = String(body.placedAt || '').trim() || new Date().toISOString().slice(0, 10);

    if (!customerId || !productId || !sellingMemberId) {
      res.status(400).json({
        error: 'Customer, product, and selling member are required.'
      });
      return;
    }

    if (!hasCustomer(customerId) || !hasProduct(productId) || !hasMember(sellingMemberId)) {
      res.status(400).json({
        error: 'Customer, product, and selling member must all exist in this tenant.'
      });
      return;
    }

    const order = addOrder({
      customerId,
      productId,
      sellingMemberId,
      quantity: Number.isFinite(quantity) ? quantity : 1,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      billingCycle,
      status,
      placedAt
    });

    res.status(201).json({ order });
  }
);

app.listen(config.port, '127.0.0.1', () => {
  console.log(`MLM Hosting SaaS API listening on http://127.0.0.1:${config.port}`);
});
