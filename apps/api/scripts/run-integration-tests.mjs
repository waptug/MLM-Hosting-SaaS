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

let createdSalesGroupId = null;
let createdInvitationId = null;
let createdAcceptedUserEmail = null;
let payoutBatchStateResetNeeded = false;
const payoutBatchId = '00000000-0000-0000-0000-000000000601';
const uniqueSuffix = randomUUID().slice(0, 8).toUpperCase();
let sessionCookie = '';
let invitedSessionCookie = '';

async function invoke(method, path, { headers = {}, body } = {}) {
  const request = httpMocks.createRequest({
    method,
    url: path,
    headers,
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
  sessionCookie = String(login.headers['set-cookie'] || '').split(';')[0];
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
      ),
    'Audit log did not capture the created invitation.'
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
  invitedSessionCookie = String(acceptInvitation.headers['set-cookie'] || '').split(';')[0];
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

  const logout = await invoke('POST', '/api/auth/logout', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(logout.status === 200, 'Logout request failed.');

  const loggedOutSession = await invoke('GET', '/api/session', {
    headers: {
      cookie: sessionCookie
    }
  });
  assert(loggedOutSession.status === 401, 'Logged out session should no longer resolve.');

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          'health',
          'bootstrap',
          'session',
          'finance tenant context',
          'password login and cookie session',
          'tenant user role denial',
          'sales group create and list',
          'audit log capture',
          'invitation create and list',
          'payout approve and pay',
          'invitation acceptance and invited login',
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

  if (createdAcceptedUserEmail) {
    await pool.query('DELETE FROM tenant_users WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [createdAcceptedUserEmail]);
    await pool.query('DELETE FROM users WHERE email = $1', [createdAcceptedUserEmail]);
  }

  if (createdInvitationId) {
    await pool.query('DELETE FROM tenant_invitations WHERE id = $1', [createdInvitationId]);
  }

  if (createdSalesGroupId) {
    await pool.query('DELETE FROM sales_groups WHERE id = $1', [createdSalesGroupId]);
  }

  await closePool();
}
