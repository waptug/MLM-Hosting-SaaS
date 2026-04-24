import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import process from 'node:process';
import httpMocks from 'node-mocks-http';
import { closePool, pool } from '@mlm-hosting-saas/database';
import { app } from '../dist/apps/api/src/index.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required for API integration tests.');
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readCookieHeader(headers) {
  const rawCookie = headers['set-cookie'];
  if (Array.isArray(rawCookie)) return String(rawCookie[0] || '').split(';')[0];
  return String(rawCookie || '').split(';')[0];
}

let createdSalesGroupId = null;
let createdInvitationId = null;
let createdRevokedInvitationId = null;
let createdAcceptedUserEmail = null;
let payoutBatchStateResetNeeded = false;
let billingInvoiceStateResetNeeded = false;
let billingSubscriptionCancelResetNeeded = false;
const payoutBatchId = '00000000-0000-0000-0000-000000000601';
const billingInvoiceId = '00000000-0000-0000-0000-000000000811';
const uniqueSuffix = randomUUID().slice(0, 8).toUpperCase();
let sessionCookie = '';
let invitedSessionCookie = '';
let passwordResetTokenForOwner = '';

async function invoke(method, path, { headers = {}, body } = {}) {
  const normalizedHeaders = { ...headers };
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method).toUpperCase()) && !normalizedHeaders.origin) {
    normalizedHeaders.origin = 'http://localhost:5174';
  }
  const request = httpMocks.createRequest({
    method,
    url: path,
    headers: normalizedHeaders,
    body
  });
  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });

  await new Promise((resolve, reject) => {
    response.on('end', resolve);
    response.on('finish', resolve);
    app.handle(request, response, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  return {
    status: response.statusCode,
    headers: response._getHeaders(),
    body: response._isJSON()
      ? response._getJSONData()
      : response._getData()
  };
}

try {
  const health = await invoke('GET', '/api/health');
  assert(health.status === 200, 'Health check failed.');
  assert(health.body?.storageProvider === 'postgres', 'Expected Postgres storage provider.');

  const ready = await invoke('GET', '/api/health/ready');
  assert(ready.status === 200, 'Readiness check failed.');
  assert(ready.body?.database === 'ready', 'Readiness check did not report a ready database.');

  const bootstrap = await invoke('GET', '/api/bootstrap');
  assert(bootstrap.status === 200, 'Bootstrap request failed.');
  assert(bootstrap.body?.tenant?.slug === 'demo-hosting-group', 'Unexpected bootstrap tenant slug.');
  assert(bootstrap.body?.summary?.userCount >= 1, 'Bootstrap summary did not return tenant users.');
  assert(bootstrap.body?.capabilities?.storageProvider === 'postgres', 'Bootstrap did not report Postgres.');

  const anonymousSession = await invoke('GET', '/api/session');
  assert(anonymousSession.status === 401, 'Anonymous session should not resolve.');

  const login = await invoke('POST', '/api/auth/login', {
    headers: {
      'content-type': 'application/json'
    },
    body: {
      tenantSlug: 'demo-hosting-group',
      email: 'owner@example.com',
      password: 'demo-password'
    }
  });
  assert(login.status === 200, 'Login request failed.');
  sessionCookie = readCookieHeader(login.headers);
  assert(sessionCookie.includes('mlm_hosting_session='), 'Login did not return a session cookie.');

  const session = await invoke('GET', '/api/session', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(session.status === 200, 'Session request failed.');
  assert(session.body?.user?.email === 'owner@example.com', 'Owner session did not resolve after login.');

  const financeContext = await invoke('GET', '/api/tenant-context', {
    headers: {
      'x-tenant-slug': 'demo-hosting-group',
      'x-user-email': 'finance@example.com'
    }
  });
  assert(financeContext.status === 200, 'Finance tenant context request failed.');
  assert(
    financeContext.body?.capabilities?.canApprovePayouts === true,
    'Finance role payout capability missing.'
  );

  const commissionPlans = await invoke('GET', '/api/admin/commission-plans', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(commissionPlans.status === 200, 'Commission plan list request failed.');
  assert(
    Array.isArray(commissionPlans.body?.plans) &&
      commissionPlans.body.plans.some((plan) => plan.planName === 'Default Hosting Commission Plan') &&
      Array.isArray(commissionPlans.body?.rules) &&
      commissionPlans.body.rules.some((rule) => rule.ruleKey === 'level-1-override'),
    'Commission plan list did not return the seeded plan and rules.'
  );

  const payoutItems = await invoke('GET', '/api/admin/payout-items', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(payoutItems.status === 200, 'Payout item list request failed.');
  assert(
    Array.isArray(payoutItems.body?.items) &&
      payoutItems.body.items.some((item) => item.batchId === payoutBatchId && item.totalAmount > 0),
    'Payout item list did not return seeded batch line items.'
  );

  const commissionSnapshots = await invoke('GET', '/api/admin/commission-snapshots', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(commissionSnapshots.status === 200, 'Commission snapshot list request failed.');
  assert(
    Array.isArray(commissionSnapshots.body?.snapshots) &&
      commissionSnapshots.body.snapshots.some((snapshot) => snapshot.batchId === payoutBatchId && snapshot.totalCommission > 0),
    'Commission snapshot list did not return seeded history.'
  );

  const billing = await invoke('GET', '/api/admin/billing', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(billing.status === 200, 'Billing summary request failed.');
  assert(
    billing.body?.subscription?.planKey === 'growth' &&
      Array.isArray(billing.body?.invoices) &&
      billing.body.invoices.some((invoice) => invoice.invoiceNumber === 'INV-2026-004' && invoice.status === 'open'),
    'Billing summary did not return seeded subscription and invoice data.'
  );

  const updateBilling = await invoke('PUT', '/api/admin/billing/subscription', {
    headers: {
      'content-type': 'application/json',
      cookie: sessionCookie
    },
    body: {
      planKey: 'growth',
      planName: 'Growth Partner',
      billingInterval: 'monthly',
      status: 'active',
      seatLimit: 30,
      pricePerPeriod: 149,
      currency: 'USD',
      currentPeriodStart: '2026-04-01',
      currentPeriodEnd: '2026-04-30',
      trialEndsAt: null,
      cancelAtPeriodEnd: true
    }
  });
  assert(updateBilling.status === 200, 'Billing subscription update failed.');
  billingSubscriptionCancelResetNeeded = true;
  assert(updateBilling.body?.subscription?.cancelAtPeriodEnd === true, 'Billing subscription cancel flag did not update.');

  const payInvoice = await invoke('POST', `/api/admin/billing/invoices/${billingInvoiceId}/pay`, {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(payInvoice.status === 200, 'Billing invoice payment failed.');
  billingInvoiceStateResetNeeded = true;
  assert(payInvoice.body?.invoice?.status === 'paid', 'Billing invoice did not move to paid.');

  const forbiddenTenantUsers = await invoke('GET', '/api/admin/tenant-users', {
    headers: {
      'x-tenant-slug': 'demo-hosting-group',
      'x-user-email': 'rep@example.com'
    }
  });
  assert(forbiddenTenantUsers.status === 403, 'Sales rep should not access tenant user admin.');

  const salesGroupsBefore = await invoke('GET', '/api/admin/sales-groups', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(salesGroupsBefore.status === 200, 'Sales group list request failed.');
  const baselineCount = salesGroupsBefore.body?.salesGroups?.length ?? 0;

  const createSalesGroup = await invoke('POST', '/api/admin/sales-groups', {
    headers: {
      'content-type': 'application/json',
      cookie: sessionCookie
    },
    body: {
      name: `Integration Group ${uniqueSuffix}`,
      code: `IT${uniqueSuffix}`,
      region: 'West',
      managerEmail: 'owner@example.com',
      status: 'active',
      notes: 'Created by automated integration test.'
    }
  });
  assert(createSalesGroup.status === 201, 'Sales group create request failed.');

  createdSalesGroupId = createSalesGroup.body?.salesGroup?.id ?? null;
  assert(createdSalesGroupId, 'Created sales group did not return an id.');

  const salesGroupsAfter = await invoke('GET', '/api/admin/sales-groups', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(salesGroupsAfter.status === 200, 'Sales group list after create failed.');
  assert(
    (salesGroupsAfter.body?.salesGroups?.length ?? 0) === baselineCount + 1,
    'Sales group count did not increase after create.'
  );

  const auditLogs = await invoke('GET', '/api/admin/audit-logs', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(auditLogs.status === 200, 'Audit log list request failed.');
  assert(
    Array.isArray(auditLogs.body?.entries) &&
      auditLogs.body.entries.some((entry) => entry.actionKey === 'sales_group.created' && entry.entityId === createdSalesGroupId),
    'Audit log did not capture the created sales group.'
  );

  const invitationsBefore = await invoke('GET', '/api/admin/invitations', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(invitationsBefore.status === 200, 'Invitation list request failed.');
  const invitationBaselineCount = invitationsBefore.body?.invitations?.length ?? 0;

  const createInvitation = await invoke('POST', '/api/admin/invitations', {
    headers: {
      'content-type': 'application/json',
      cookie: sessionCookie
    },
    body: {
      email: `invite-${uniqueSuffix.toLowerCase()}@example.com`,
      firstName: 'Invite',
      lastName: uniqueSuffix,
      role: 'sales_rep'
    }
  });
  assert(createInvitation.status === 201, 'Invitation create request failed.');
  createdInvitationId = createInvitation.body?.invitation?.id ?? null;
  createdAcceptedUserEmail = createInvitation.body?.invitation?.email ?? null;
  assert(createdInvitationId, 'Created invitation did not return an id.');
  assert(createInvitation.body?.invitation?.acceptanceToken, 'Created invitation did not return an acceptance token.');

  const sendInvitation = await invoke('POST', `/api/admin/invitations/${createdInvitationId}/send`, {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(sendInvitation.status === 200, 'Invitation send request failed.');
  assert(sendInvitation.body?.delivery?.deliveryType === 'invitation', 'Invitation send did not create an invitation delivery log.');

  const invitationsAfter = await invoke('GET', '/api/admin/invitations', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(invitationsAfter.status === 200, 'Invitation list after create failed.');
  assert(
    (invitationsAfter.body?.invitations?.length ?? 0) === invitationBaselineCount + 1,
    'Invitation count did not increase after create.'
  );

  const auditLogsAfterInvite = await invoke('GET', '/api/admin/audit-logs', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(auditLogsAfterInvite.status === 200, 'Audit log list after invitation failed.');
  assert(
    Array.isArray(auditLogsAfterInvite.body?.entries) &&
      auditLogsAfterInvite.body.entries.some(
        (entry) => entry.actionKey === 'tenant.invitation.created' && entry.entityId === createdInvitationId
      ) &&
      auditLogsAfterInvite.body.entries.some(
        (entry) => entry.actionKey === 'tenant.invitation.sent' && entry.entityId === createdInvitationId
      ),
    'Audit log did not capture the invitation create and send actions.'
  );

  const createRevokedInvitation = await invoke('POST', '/api/admin/invitations', {
    headers: {
      'content-type': 'application/json',
      cookie: sessionCookie
    },
    body: {
      email: `revoked-${uniqueSuffix.toLowerCase()}@example.com`,
      firstName: 'Revoked',
      lastName: uniqueSuffix,
      role: 'sales_rep'
    }
  });
  assert(createRevokedInvitation.status === 201, 'Revoked invitation create request failed.');
  createdRevokedInvitationId = createRevokedInvitation.body?.invitation?.id ?? null;
  assert(createdRevokedInvitationId, 'Created revoked invitation did not return an id.');

  const revokeInvitation = await invoke('POST', `/api/admin/invitations/${createdRevokedInvitationId}/revoke`, {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(revokeInvitation.status === 200, 'Invitation revoke request failed.');
  assert(revokeInvitation.body?.invitation?.status === 'revoked', 'Invitation did not move to revoked.');

  const auditLogsAfterRevoke = await invoke('GET', '/api/admin/audit-logs', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(auditLogsAfterRevoke.status === 200, 'Audit log list after invitation revoke failed.');
  assert(
    Array.isArray(auditLogsAfterRevoke.body?.entries) &&
      auditLogsAfterRevoke.body.entries.some(
        (entry) => entry.actionKey === 'tenant.invitation.revoked' && entry.entityId === createdRevokedInvitationId
      ),
    'Audit log did not capture the invitation revoke action.'
  );

  const approvePayout = await invoke('POST', `/api/admin/payouts/${payoutBatchId}/approve`, {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(approvePayout.status === 200, 'Payout approve request failed.');
  assert(approvePayout.body?.batch?.status === 'approved', 'Payout batch did not move to approved.');
  payoutBatchStateResetNeeded = true;

  const payPayout = await invoke('POST', `/api/admin/payouts/${payoutBatchId}/pay`, {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(payPayout.status === 200, 'Payout pay request failed.');
  assert(payPayout.body?.batch?.status === 'paid', 'Payout batch did not move to paid.');

  const auditLogsAfterPayout = await invoke('GET', '/api/admin/audit-logs', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(auditLogsAfterPayout.status === 200, 'Audit log list after payout actions failed.');
  assert(
    Array.isArray(auditLogsAfterPayout.body?.entries) &&
      auditLogsAfterPayout.body.entries.some(
        (entry) => entry.actionKey === 'payout_batch.approved' && entry.entityId === payoutBatchId
      ) &&
      auditLogsAfterPayout.body.entries.some(
        (entry) => entry.actionKey === 'payout_batch.paid' && entry.entityId === payoutBatchId
      ),
    'Audit log did not capture payout approval and payment.'
  );

  const acceptInvitation = await invoke('POST', '/api/auth/accept-invitation', {
    headers: {
      'content-type': 'application/json'
    },
    body: {
      tenantSlug: 'demo-hosting-group',
      invitationToken: createInvitation.body.invitation.acceptanceToken,
      password: 'invite-password'
    }
  });
  assert(acceptInvitation.status === 201, 'Invitation acceptance request failed.');
  invitedSessionCookie = readCookieHeader(acceptInvitation.headers);
  assert(invitedSessionCookie.includes('mlm_hosting_session='), 'Invitation acceptance did not return a session cookie.');

  const invitedSession = await invoke('GET', '/api/session', {
    headers: {
      cookie: invitedSessionCookie
    }
  });
  assert(invitedSession.status === 200, 'Accepted invitation session did not resolve.');
  assert(invitedSession.body?.user?.email === createdAcceptedUserEmail, 'Accepted invitation user email mismatch.');

  const invitedLogin = await invoke('POST', '/api/auth/login', {
    headers: {
      'content-type': 'application/json'
    },
    body: {
      tenantSlug: 'demo-hosting-group',
      email: createdAcceptedUserEmail,
      password: 'invite-password'
    }
  });
  assert(invitedLogin.status === 200, 'Invited user login failed after acceptance.');

  const requestPasswordReset = await invoke('POST', '/api/auth/request-password-reset', {
    headers: {
      'content-type': 'application/json'
    },
    body: {
      tenantSlug: 'demo-hosting-group',
      email: 'owner@example.com'
    }
  });
  assert(requestPasswordReset.status === 201, 'Password reset request failed.');
  passwordResetTokenForOwner = requestPasswordReset.body?.resetToken ?? '';
  assert(passwordResetTokenForOwner, 'Password reset request did not return a reset token.');

  const resetPasswordRequest = await invoke('POST', '/api/auth/reset-password', {
    headers: {
      'content-type': 'application/json'
    },
    body: {
      tenantSlug: 'demo-hosting-group',
      resetToken: passwordResetTokenForOwner,
      password: 'demo-password-updated'
    }
  });
  assert(resetPasswordRequest.status === 200, 'Password reset completion failed.');

  const reloginAfterReset = await invoke('POST', '/api/auth/login', {
    headers: {
      'content-type': 'application/json'
    },
    body: {
      tenantSlug: 'demo-hosting-group',
      email: 'owner@example.com',
      password: 'demo-password-updated'
    }
  });
  assert(reloginAfterReset.status === 200, 'Login with reset password failed.');

  const deliveryLogs = await invoke('GET', '/api/admin/email-delivery-logs', {
    headers: {
      cookie: readCookieHeader(reloginAfterReset.headers) || sessionCookie
    }
  });
  assert(deliveryLogs.status === 200, 'Email delivery log list request failed.');
  assert(
    Array.isArray(deliveryLogs.body?.deliveries) &&
      deliveryLogs.body.deliveries.some(
        (entry) => entry.deliveryType === 'invitation' && entry.relatedEntityId === createdInvitationId
      ) &&
      deliveryLogs.body.deliveries.some(
        (entry) => entry.deliveryType === 'password_reset' && entry.recipientEmail === 'owner@example.com'
    ),
    'Email delivery log did not capture invitation and password reset deliveries.'
  );

  const loginLockoutAttempts = [];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    loginLockoutAttempts.push(
      await invoke('POST', '/api/auth/login', {
        headers: {
          'content-type': 'application/json'
        },
        body: {
          tenantSlug: 'demo-hosting-group',
          email: 'owner@example.com',
          password: 'wrong-password'
        }
      })
    );
  }
  assert(
    loginLockoutAttempts.slice(0, 4).every((attempt) => attempt.status === 401),
    'Initial failed login attempts should return unauthorized.'
  );
  assert(loginLockoutAttempts[4].status === 423, 'Login should lock after repeated failures.');
  assert(
    String(loginLockoutAttempts[4].body?.error || '').includes('locked'),
    'Lockout response should explain the lock.'
  );

  const loginDuringLockout = await invoke('POST', '/api/auth/login', {
    headers: {
      'content-type': 'application/json'
    },
    body: {
      tenantSlug: 'demo-hosting-group',
      email: 'owner@example.com',
      password: 'demo-password-updated'
    }
  });
  assert(loginDuringLockout.status === 423, 'Correct password should still be blocked during lockout.');

  const logout = await invoke('POST', '/api/auth/logout', {
    headers: {
      cookie: readCookieHeader(reloginAfterReset.headers) || sessionCookie
    }
  });
  assert(logout.status === 200, 'Logout request failed.');

  const resetSessionCookie = readCookieHeader(reloginAfterReset.headers) || sessionCookie;
  const loggedOutSession = await invoke('GET', '/api/session', {
    headers: {
      cookie: resetSessionCookie
    }
  });
  assert(loggedOutSession.status === 401, 'Logged out session should no longer resolve.');

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          'health',
          'readiness',
          'bootstrap',
          'session',
          'finance tenant context',
          'commission plan list',
          'payout item list',
          'commission snapshot list',
          'billing summary and invoice pay',
          'password login and cookie session',
          'tenant user role denial',
          'sales group create and list',
          'audit log capture',
          'invitation create and list',
          'invitation delivery logging',
          'invitation revoke',
          'payout approve and pay',
          'invitation acceptance and invited login',
          'password reset request and completion',
          'login lockout',
          'logout'
        ]
      },
      null,
      2
    )
  );
} finally {
  if (payoutBatchStateResetNeeded) {
    await pool.query(
      `
        UPDATE payout_batches
        SET
          status = 'draft',
          approved_at = NULL,
          approved_by_user_id = NULL,
          paid_at = NULL,
          paid_by_user_id = NULL,
          updated_at = NOW()
        WHERE id = $1
      `,
      [payoutBatchId]
    );
    await pool.query('DELETE FROM audit_logs WHERE entity_type = $1 AND entity_id = $2', ['payout_batch', payoutBatchId]);
  }

  if (billingInvoiceStateResetNeeded) {
    await pool.query(
      `
        UPDATE billing_invoices
        SET
          status = 'open',
          amount_paid = 0,
          balance_due = amount_due,
          updated_at = NOW()
        WHERE id = $1
      `,
      [billingInvoiceId]
    );
    await pool.query('DELETE FROM audit_logs WHERE entity_type = $1 AND entity_id = $2', ['billing_invoice', billingInvoiceId]);
  }

  if (billingSubscriptionCancelResetNeeded) {
    await pool.query(
      `
        UPDATE tenant_subscriptions
        SET cancel_at_period_end = FALSE, updated_at = NOW()
        WHERE id = $1
      `,
      ['00000000-0000-0000-0000-000000000801']
    );
    await pool.query('DELETE FROM audit_logs WHERE entity_type = $1 AND action_key = $2', [
      'tenant_subscription',
      'billing.subscription.updated'
    ]);
  }

  if (passwordResetTokenForOwner) {
    await pool.query(
      `
        UPDATE users
        SET password_hash = $2, updated_at = NOW()
        WHERE email = $1
      `,
      [
        'owner@example.com',
        'scrypt$16384$8$1$959fc91fe5609c6de5c0261c4d7f36d6$3b57554f03256bd01f0959560b96e82b4e391c6cb153da8385ceaed970001e323c44e4aae6505718c4a3f6dfe9d3fe53c29409c143bb88ea7afa6bf0e351a356'
      ]
    );
    await pool.query('DELETE FROM password_reset_tokens WHERE tenant_id = $1', ['00000000-0000-0000-0000-000000000001']);
    await pool.query(
      "DELETE FROM email_delivery_logs WHERE delivery_type = 'password_reset' AND recipient_email = 'owner@example.com'"
    );
  }

  await pool.query('DELETE FROM login_security_states WHERE tenant_id = $1 AND email = $2', [
    '00000000-0000-0000-0000-000000000001',
    'owner@example.com'
  ]);

  if (createdAcceptedUserEmail) {
    await pool.query('DELETE FROM tenant_users WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [createdAcceptedUserEmail]);
    await pool.query('DELETE FROM users WHERE email = $1', [createdAcceptedUserEmail]);
  }

  if (createdInvitationId) {
    await pool.query('DELETE FROM tenant_invitations WHERE id = $1', [createdInvitationId]);
    await pool.query("DELETE FROM email_delivery_logs WHERE delivery_type = 'invitation' AND related_entity_id = $1", [
      createdInvitationId
    ]);
  }

  if (createdRevokedInvitationId) {
    await pool.query('DELETE FROM tenant_invitations WHERE id = $1', [createdRevokedInvitationId]);
    await pool.query("DELETE FROM email_delivery_logs WHERE delivery_type = 'invitation' AND related_entity_id = $1", [
      createdRevokedInvitationId
    ]);
  }

  if (createdSalesGroupId) {
    await pool.query('DELETE FROM sales_groups WHERE id = $1', [createdSalesGroupId]);
  }

  await closePool();
}
