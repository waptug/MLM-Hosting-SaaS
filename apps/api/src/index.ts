import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { allRoles } from '../../../packages/auth/src/model.js';
import { tenantRoles } from '../../../packages/auth/src/model.js';
import { attachTenantContext, requireRole } from './auth.js';
import {
  acceptInvitation,
  authenticateUser,
  createAuthSession,
  requestPasswordReset,
  resetPassword,
  revokeAuthSession
} from './auth-state.js';
import { parseCookies, sessionCookieName } from './auth-security.js';
import { config } from './config.js';
import { demoTenant, demoUserEmail, demoUserPassword } from './demo-data.js';
import { businessRepository, businessRepositoryMode } from './repository-provider.js';
import {
  addTenantUser,
  createTenantInvitation,
  getBillingSubscription,
  getTenantSetup,
  listCommissionPlans,
  listCommissionRules,
  listCommissionSnapshots,
  listAuditLogs,
  listEmailDeliveryLogs,
  listBillingInvoiceRecords,
  listPayoutItems,
  listTenantInvitations,
  listTenantUsers,
  revokeTenantInvitation,
  markInvoicePaid,
  recordEmailDelivery,
  recordAuditLog,
  updateBillingSubscription,
  updateTenantSetup
} from './state.js';

export type BootstrapTenant = {
  slug: string;
  name: string;
  themePreset: string;
  status: 'draft' | 'active';
  ownerEmail: string;
};

export const app = express();

app.use(
  cors({
    origin: [`http://127.0.0.1:${config.webPort}`, `http://localhost:${config.webPort}`],
    credentials: true
  })
);
app.use(express.json());

function setSessionCookie(res: express.Response, sessionToken: string) {
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(sessionToken)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${config.sessionCookieSameSite[0].toUpperCase()}${config.sessionCookieSameSite.slice(1)}`
  ];
  if (config.sessionCookieSecure) parts.push('Secure');
  if (config.sessionCookieDomain) parts.push(`Domain=${config.sessionCookieDomain}`);
  parts.push(`Max-Age=${60 * 60 * 24 * config.sessionCookieMaxAgeDays}`);
  res.setHeader(
    'Set-Cookie',
    parts.join('; ')
  );
}

function clearSessionCookie(res: express.Response) {
  const parts = [
    `${sessionCookieName}=`,
    'Path=/',
    'HttpOnly',
    `SameSite=${config.sessionCookieSameSite[0].toUpperCase()}${config.sessionCookieSameSite.slice(1)}`,
    'Max-Age=0'
  ];
  if (config.sessionCookieSecure) parts.push('Secure');
  if (config.sessionCookieDomain) parts.push(`Domain=${config.sessionCookieDomain}`);
  res.setHeader('Set-Cookie', parts.join('; '));
}

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
  const [setup, tenantUsers, salesGroups, members, customers, orders, commissionSummaries, payoutBatches] =
    await Promise.all([
      getTenantSetup(),
      listTenantUsers(),
      businessRepository.listSalesGroups(),
      businessRepository.listMembers(),
      businessRepository.listCustomers(),
      businessRepository.listOrders(),
      businessRepository.listCommissionSummary(),
      businessRepository.listPayoutBatches()
    ]);

  const bootstrapTenant: BootstrapTenant = {
    slug: setup.slug,
    name: setup.name,
    themePreset: setup.themePreset,
    status: setup.status,
    ownerEmail: setup.ownerEmail
  };

  const activeOrders = orders.filter((order) => order.status === 'active');
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const activeRevenue = activeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingRevenue = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const draftPayoutTotal = payoutBatches
    .filter((batch) => batch.status === 'draft')
    .reduce((sum, batch) => sum + batch.totalAmount, 0);

  res.json({
    tenant: { ...bootstrapTenant, ...setup },
    summary: {
      userCount: tenantUsers.length,
      salesGroupCount: salesGroups.length,
      memberCount: members.length,
      customerCount: customers.length,
      activeOrderCount: activeOrders.length,
      pendingOrderCount: pendingOrders.length,
      activeRevenue,
      pendingRevenue,
      commissionPayeeCount: commissionSummaries.filter((entry) => entry.totalCommission > 0).length,
      draftPayoutTotal
    },
    capabilities: {
      multiTenant: true,
      whiteLabel: true,
      payouts: 'active_summary',
      commissionEngine: 'active_summary',
      storageProvider: config.storageProvider
    },
    nextBuildTargets: [
      'approval-based payout workflows',
      'billing and subscriptions',
      'password reset and invite delivery',
      'background jobs'
    ]
  });
});

app.post('/api/auth/login', async (req, res) => {
  const body = req.body || {};
  const tenantSlug = String(body.tenantSlug || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!tenantSlug || !email || !password) {
    res.status(400).json({ error: 'Tenant slug, email, and password are required.' });
    return;
  }

  const authenticated = await authenticateUser({ tenantSlug, email, password });
  if (!authenticated) {
    res.status(401).json({ error: 'Invalid tenant, email, or password.' });
    return;
  }

  const session = await createAuthSession(authenticated);
  setSessionCookie(res, session.sessionToken);
  res.json({
    ok: true,
    tenantSlug,
    email,
    expiresAt: session.expiresAt
  });
});

app.post('/api/auth/logout', async (req, res) => {
  const cookies = parseCookies(req.header('cookie'));
  const sessionToken = cookies[sessionCookieName];
  if (sessionToken) {
    await revokeAuthSession(sessionToken);
  }

  clearSessionCookie(res);
  res.json({ ok: true });
});

app.post('/api/auth/accept-invitation', async (req, res) => {
  const body = req.body || {};
  const tenantSlug = String(body.tenantSlug || '').trim();
  const invitationToken = String(body.invitationToken || '').trim();
  const password = String(body.password || '');

  if (!tenantSlug || !invitationToken || password.length < 8) {
    res.status(400).json({
      error: 'Tenant slug, invitation token, and a password with at least 8 characters are required.'
    });
    return;
  }

  try {
    const accepted = await acceptInvitation({
      tenantSlug,
      invitationToken,
      password
    });
    const session = await createAuthSession(accepted);
    setSessionCookie(res, session.sessionToken);

    await recordAuditLog({
      actorEmail: accepted.email,
      actionKey: 'tenant.invitation.accepted',
      entityType: 'tenant_invitation',
      entityId: accepted.userId,
      summary: `Accepted invitation for ${accepted.email}.`,
      details: {
        tenantSlug: accepted.tenantSlug,
        role: accepted.role
      }
    });

    res.status(201).json({
      ok: true,
      tenantSlug: accepted.tenantSlug,
      email: accepted.email,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Unable to accept invitation.'
    });
  }
});

app.post('/api/auth/request-password-reset', async (req, res) => {
  const body = req.body || {};
  const tenantSlug = String(body.tenantSlug || '').trim();
  const email = String(body.email || '').trim().toLowerCase();

  if (!tenantSlug || !email) {
    res.status(400).json({ error: 'Tenant slug and email are required.' });
    return;
  }

  const resetRequest = await requestPasswordReset({ tenantSlug, email });
  if (!resetRequest) {
    res.status(404).json({ error: 'No tenant user matched that email.' });
    return;
  }

  const delivery = await recordEmailDelivery({
    recipientEmail: resetRequest.email,
    deliveryType: 'password_reset',
    subjectLine: `Password reset for ${tenantSlug}`,
    tokenPreview: resetRequest.resetToken,
    relatedEntityType: 'user',
    relatedEntityId: resetRequest.userId
  });

  await recordAuditLog({
    actorEmail: resetRequest.email,
    actionKey: 'auth.password_reset.requested',
    entityType: 'user',
    entityId: resetRequest.userId,
    summary: `Requested password reset for ${resetRequest.email}.`,
    details: {
      tenantSlug,
      expiresAt: resetRequest.expiresAt
    }
  });

  res.status(201).json({
    ok: true,
    email: resetRequest.email,
    expiresAt: resetRequest.expiresAt,
    resetToken: resetRequest.resetToken,
    delivery
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const body = req.body || {};
  const tenantSlug = String(body.tenantSlug || '').trim();
  const resetToken = String(body.resetToken || '').trim();
  const password = String(body.password || '');

  if (!tenantSlug || !resetToken || password.length < 8) {
    res.status(400).json({
      error: 'Tenant slug, reset token, and a password with at least 8 characters are required.'
    });
    return;
  }

  try {
    const reset = await resetPassword({ tenantSlug, resetToken, password });
    const session = await createAuthSession(reset);

    setSessionCookie(res, session.sessionToken);
    await recordAuditLog({
      actorEmail: reset.email,
      actionKey: 'auth.password_reset.completed',
      entityType: 'user',
      entityId: reset.userId,
      summary: `Completed password reset for ${reset.email}.`,
      details: { tenantSlug }
    });

    res.json({
      ok: true,
      email: reset.email,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Unable to reset password.'
    });
  }
});

app.get('/api/auth/demo-credentials', (_req, res) => {
  res.json({
    tenantSlug: demoTenant.slug,
    email: demoUserEmail,
    password: demoUserPassword
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

    const setup = await nextSetup;
    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'tenant.setup.updated',
      entityType: 'tenant',
      entityId: req.tenantContext?.tenant.id,
      summary: `Updated tenant setup for ${setup.name}.`,
      details: {
        slug: setup.slug,
        status: setup.status,
        themePreset: setup.themePreset
      }
    });

    res.json({ setup });
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

app.get(
  '/api/admin/invitations',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  async (_req, res) => {
    res.json({ invitations: await listTenantInvitations() });
  }
);

app.post(
  '/api/admin/invitations/:id/send',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  async (req, res) => {
    const invitationId = String(req.params.id || '');
    const invitations = await listTenantInvitations();
    const invitation = invitations.find((entry) => entry.id === invitationId);

    if (!invitation || invitation.status !== 'pending' || !invitation.acceptanceToken) {
      res.status(404).json({ error: 'Invitation not found, is not pending, or does not expose a delivery token.' });
      return;
    }

    const delivery = await recordEmailDelivery({
      recipientEmail: invitation.email,
      deliveryType: 'invitation',
      subjectLine: `Invitation to join ${req.tenantContext?.tenant.name}`,
      tokenPreview: invitation.acceptanceToken,
      relatedEntityType: 'tenant_invitation',
      relatedEntityId: invitation.id
    });

    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'tenant.invitation.sent',
      entityType: 'tenant_invitation',
      entityId: invitation.id,
      summary: `Sent invitation to ${invitation.email}.`,
      details: {
        role: invitation.role,
        deliveryId: delivery.id
      }
    });

    res.json({ delivery });
  }
);

app.post(
  '/api/admin/invitations/:id/revoke',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager']),
  async (req, res) => {
    const invitationId = String(req.params.id || '');
    try {
      const invitation = await revokeTenantInvitation(invitationId);

      await recordAuditLog({
        actorEmail: req.tenantContext?.user.email,
        actionKey: 'tenant.invitation.revoked',
        entityType: 'tenant_invitation',
        entityId: invitation.id,
        summary: `Revoked invitation for ${invitation.email}.`,
        details: {
          role: invitation.role,
          status: invitation.status
        }
      });

      res.json({ invitation });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Unable to revoke invitation.'
      });
    }
  }
);

app.post(
  '/api/admin/invitations',
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

    try {
      const invitation = await createTenantInvitation({
        actorEmail: req.tenantContext?.user.email,
        email,
        firstName,
        lastName,
        role: role as (typeof tenantRoles)[number]
      });

      await recordAuditLog({
        actorEmail: req.tenantContext?.user.email,
        actionKey: 'tenant.invitation.created',
        entityType: 'tenant_invitation',
        entityId: invitation.id,
        summary: `Created invitation for ${invitation.email} as ${invitation.role}.`,
        details: {
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt
        }
      });

      res.status(201).json({ invitation });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Unable to create invitation.'
      });
    }
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

    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'tenant.user.created',
      entityType: 'tenant_user',
      entityId: user.id,
      summary: `Added tenant user ${user.email} as ${user.role}.`,
      details: {
        email: user.email,
        role: user.role
      }
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

    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'sales_group.created',
      entityType: 'sales_group',
      entityId: salesGroup.id,
      summary: `Created sales group ${salesGroup.name}.`,
      details: {
        code: salesGroup.code,
        status: salesGroup.status
      }
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

    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'member.created',
      entityType: 'member',
      entityId: member.id,
      summary: `Created member ${member.firstName} ${member.lastName}.`,
      details: {
        email: member.email,
        salesGroupId: member.salesGroupId,
        status: member.status
      }
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

    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'customer.created',
      entityType: 'customer',
      entityId: customer.id,
      summary: `Created customer ${customer.companyName}.`,
      details: {
        ownerMemberId: customer.ownerMemberId,
        status: customer.status
      }
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

    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'order.created',
      entityType: 'order',
      entityId: order.id,
      summary: `Created ${order.status} order for ${order.customerName}.`,
      details: {
        productId: order.productId,
        sellingMemberId: order.sellingMemberId,
        totalAmount: order.totalAmount
      }
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
  '/api/admin/commission-plans',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'finance_manager']),
  async (_req, res) => {
    res.json({
      plans: await listCommissionPlans(),
      rules: await listCommissionRules()
    });
  }
);

app.get(
  '/api/admin/commission-snapshots',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'finance_manager']),
  async (_req, res) => {
    res.json({ snapshots: await listCommissionSnapshots() });
  }
);

app.get(
  '/api/admin/billing',
  attachTenantContext,
  requireRole(['tenant_owner', 'finance_manager']),
  async (_req, res) => {
    res.json({
      subscription: await getBillingSubscription(),
      invoices: await listBillingInvoiceRecords()
    });
  }
);

app.put(
  '/api/admin/billing/subscription',
  attachTenantContext,
  requireRole(['tenant_owner', 'finance_manager']),
  async (req, res) => {
    const body = req.body || {};
    const subscription = await updateBillingSubscription({
      planKey: String(body.planKey || '').trim() || undefined,
      planName: String(body.planName || '').trim() || undefined,
      billingInterval: body.billingInterval === 'annual' ? 'annual' : 'monthly',
      status: ['trialing', 'active', 'past_due', 'canceled'].includes(String(body.status || ''))
        ? (body.status as 'trialing' | 'active' | 'past_due' | 'canceled')
        : undefined,
      seatLimit: Number.isFinite(Number(body.seatLimit)) ? Math.max(1, Number(body.seatLimit)) : undefined,
      pricePerPeriod: Number.isFinite(Number(body.pricePerPeriod)) ? Math.max(0, Number(body.pricePerPeriod)) : undefined,
      currency: String(body.currency || '').trim() || undefined,
      currentPeriodStart: String(body.currentPeriodStart || '').trim() || undefined,
      currentPeriodEnd: String(body.currentPeriodEnd || '').trim() || undefined,
      trialEndsAt: body.trialEndsAt ? String(body.trialEndsAt).trim() : null,
      cancelAtPeriodEnd: Boolean(body.cancelAtPeriodEnd)
    });

    await recordAuditLog({
      actorEmail: req.tenantContext?.user.email,
      actionKey: 'billing.subscription.updated',
      entityType: 'tenant_subscription',
      entityId: subscription.id,
      summary: `Updated billing subscription to ${subscription.planName}.`,
      details: {
        status: subscription.status,
        billingInterval: subscription.billingInterval,
        pricePerPeriod: subscription.pricePerPeriod
      }
    });

    res.json({ subscription });
  }
);

app.post(
  '/api/admin/billing/invoices/:id/pay',
  attachTenantContext,
  requireRole(['tenant_owner', 'finance_manager']),
  async (req, res) => {
    const invoiceId = String(req.params.id || '').trim();
    try {
      const invoice = await markInvoicePaid(invoiceId, req.tenantContext!.user.email);
      await recordAuditLog({
        actorEmail: req.tenantContext?.user.email,
        actionKey: 'billing.invoice.paid',
        entityType: 'billing_invoice',
        entityId: invoice.id,
        summary: `Marked billing invoice ${invoice.invoiceNumber} paid.`,
        details: {
          status: invoice.status,
          amountDue: invoice.amountDue
        }
      });
      res.json({ invoice });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Unable to mark invoice paid.'
      });
    }
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

app.get(
  '/api/admin/payout-items',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'finance_manager']),
  async (_req, res) => {
    res.json({ items: await listPayoutItems() });
  }
);

app.post(
  '/api/admin/payouts/:id/approve',
  attachTenantContext,
  requireRole(['tenant_owner', 'finance_manager']),
  async (req, res) => {
    const batchId = String(req.params.id || '');
    try {
      const batch = await businessRepository.approvePayoutBatch(batchId, req.tenantContext!.user.email);
      await recordAuditLog({
        actorEmail: req.tenantContext?.user.email,
        actionKey: 'payout_batch.approved',
        entityType: 'payout_batch',
        entityId: batch.id,
        summary: `Approved payout batch ${batch.periodLabel}.`,
        details: {
          status: batch.status,
          totalAmount: batch.totalAmount
        }
      });
      res.json({ batch });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Unable to approve payout batch.'
      });
    }
  }
);

app.post(
  '/api/admin/payouts/:id/pay',
  attachTenantContext,
  requireRole(['tenant_owner', 'finance_manager']),
  async (req, res) => {
    const batchId = String(req.params.id || '');
    try {
      const batch = await businessRepository.markPayoutBatchPaid(batchId, req.tenantContext!.user.email);
      await recordAuditLog({
        actorEmail: req.tenantContext?.user.email,
        actionKey: 'payout_batch.paid',
        entityType: 'payout_batch',
        entityId: batch.id,
        summary: `Marked payout batch ${batch.periodLabel} paid.`,
        details: {
          status: batch.status,
          totalAmount: batch.totalAmount
        }
      });
      res.json({ batch });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Unable to mark payout batch paid.'
      });
    }
  }
);

app.get(
  '/api/admin/audit-logs',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'finance_manager']),
  async (_req, res) => {
    res.json({ entries: await listAuditLogs() });
  }
);

app.get(
  '/api/admin/email-delivery-logs',
  attachTenantContext,
  requireRole(['tenant_owner', 'tenant_manager', 'finance_manager']),
  async (_req, res) => {
    res.json({ deliveries: await listEmailDeliveryLogs() });
  }
);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(config.port, '127.0.0.1', () => {
    console.log(`MLM Hosting SaaS API listening on http://127.0.0.1:${config.port}`);
  });
}
