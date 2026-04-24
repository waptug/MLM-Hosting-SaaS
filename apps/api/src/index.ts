import cors from 'cors';
import express from 'express';
import { allRoles } from '../../../packages/auth/src/model.js';
import { tenantRoles } from '../../../packages/auth/src/model.js';
import { attachTenantContext, requireRole } from './auth.js';
import { config } from './config.js';
import { demoTenant } from './demo-data.js';
import { businessRepository, businessRepositoryMode } from './repository-provider.js';
import {
  addTenantUser,
  getTenantSetup,
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
    env: config.nodeEnv,
    storageProvider: config.storageProvider,
    repositoryMode: businessRepositoryMode
  });
});

app.get('/api/bootstrap', async (_req, res) => {
  const setup = await getTenantSetup();
  const bootstrapTenant: BootstrapTenant = {
    slug: setup.slug,
    name: setup.name,
    themePreset: setup.themePreset,
    status: setup.status,
    ownerEmail: setup.ownerEmail
  };
  res.json({
    tenant: { ...bootstrapTenant, ...setup },
    capabilities: {
      multiTenant: true,
      whiteLabel: true,
      payouts: 'planned',
      commissionEngine: 'planned',
      storageProvider: config.storageProvider
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
  async (_req, res) => {
    res.json({ setup: await getTenantSetup() });
  }
);

app.put(
  '/api/admin/onboarding',
  attachTenantContext,
  requireRole(['tenant_owner']),
  async (req, res) => {
    const payload = req.body || {};
    const currentSetup = await getTenantSetup();
    const nextSetup = updateTenantSetup({
      slug: String(payload.slug || '').trim() || currentSetup.slug,
      name: String(payload.name || '').trim() || currentSetup.name,
      themePreset: String(payload.themePreset || '').trim() || currentSetup.themePreset,
      status: payload.status === 'active' ? 'active' : 'draft',
      ownerEmail: String(payload.ownerEmail || '').trim() || currentSetup.ownerEmail,
      supportEmail: String(payload.supportEmail || '').trim() || currentSetup.supportEmail,
      brandLabel: String(payload.brandLabel || '').trim() || currentSetup.brandLabel,
      primaryDomain: String(payload.primaryDomain || '').trim() || currentSetup.primaryDomain
    });

    res.json({ setup: await nextSetup });
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
  async (_req, res) => {
    res.json({ users: await listTenantUsers() });
  }
);

app.post(
  '/api/admin/tenant-users',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  async (req, res) => {
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

    const user = await addTenantUser({
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
  async (_req, res) => {
    res.json({ salesGroups: await businessRepository.listSalesGroups() });
  }
);

app.post(
  '/api/admin/sales-groups',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  async (req, res) => {
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

    const salesGroup = await businessRepository.addSalesGroup({
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
  async (_req, res) => {
    res.json({ members: await businessRepository.listMembers() });
  }
);

app.post(
  '/api/admin/members',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter']),
  async (req, res) => {
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

    const member = await businessRepository.addMember({
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
  async (_req, res) => {
    res.json({ customers: await businessRepository.listCustomers() });
  }
);

app.post(
  '/api/admin/customers',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  async (req, res) => {
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

    if (!(await businessRepository.hasMember(ownerMemberId))) {
      res.status(400).json({
        error: 'Owner member must match an existing member in this tenant.'
      });
      return;
    }

    const customer = await businessRepository.addCustomer({
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
  async (_req, res) => {
    res.json({ products: await businessRepository.listProducts() });
  }
);

app.get(
  '/api/admin/orders',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  async (_req, res) => {
    res.json({ orders: await businessRepository.listOrders() });
  }
);

app.post(
  '/api/admin/orders',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'recruiter', 'sales_rep']),
  async (req, res) => {
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

    if (
      !(await businessRepository.hasCustomer(customerId)) ||
      !(await businessRepository.hasProduct(productId)) ||
      !(await businessRepository.hasMember(sellingMemberId))
    ) {
      res.status(400).json({
        error: 'Customer, product, and selling member must all exist in this tenant.'
      });
      return;
    }

    const order = await businessRepository.addOrder({
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

app.get(
  '/api/admin/commissions',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'finance_manager']),
  async (_req, res) => {
    res.json({ summaries: await businessRepository.listCommissionSummary() });
  }
);

app.get(
  '/api/admin/payouts',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'finance_manager']),
  async (_req, res) => {
    res.json({ batches: await businessRepository.listPayoutBatches() });
  }
);

app.listen(config.port, '127.0.0.1', () => {
  console.log(`MLM Hosting SaaS API listening on http://127.0.0.1:${config.port}`);
});
