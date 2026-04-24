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
const uniqueSuffix = randomUUID().slice(0, 8).toUpperCase();

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

  const session = await invoke('GET', '/api/session');
  assert(session.status === 200, 'Session request failed.');
  assert(session.body?.user?.email === 'owner@example.com', 'Default owner session did not resolve.');

  const financeContext = await invoke('GET', '/api/tenant-context', {
    headers: {
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
      'x-user-email': 'rep@example.com'
    }
  });
  assert(forbiddenTenantUsers.status === 403, 'Sales rep should not access tenant user admin.');

  const salesGroupsBefore = await invoke('GET', '/api/admin/sales-groups');
  assert(salesGroupsBefore.status === 200, 'Sales group list request failed.');
  const baselineCount = salesGroupsBefore.body?.salesGroups?.length ?? 0;

  const createSalesGroup = await invoke('POST', '/api/admin/sales-groups', {
    headers: {
      'content-type': 'application/json'
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

  const salesGroupsAfter = await invoke('GET', '/api/admin/sales-groups');
  assert(salesGroupsAfter.status === 200, 'Sales group list after create failed.');
  assert(
    (salesGroupsAfter.body?.salesGroups?.length ?? 0) === baselineCount + 1,
    'Sales group count did not increase after create.'
  );

  const auditLogs = await invoke('GET', '/api/admin/audit-logs');
  assert(auditLogs.status === 200, 'Audit log list request failed.');
  assert(
    Array.isArray(auditLogs.body?.entries) &&
      auditLogs.body.entries.some((entry) => entry.actionKey === 'sales_group.created' && entry.entityId === createdSalesGroupId),
    'Audit log did not capture the created sales group.'
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          'health',
          'bootstrap',
          'session',
          'finance tenant context',
          'tenant user role denial',
          'sales group create and list',
          'audit log capture'
        ]
      },
      null,
      2
    )
  );
} finally {
  if (createdSalesGroupId) {
    await pool.query('DELETE FROM sales_groups WHERE id = $1', [createdSalesGroupId]);
  }

  await closePool();
}
