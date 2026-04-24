import { randomUUID } from 'node:crypto';
import { demoTenant } from './demo-data.js';
import type {
  CommissionSummary,
  Customer,
  Member,
  Order,
  PayoutBatch,
  Product,
  SalesGroup
} from './state.js';
import { listCommissionRules } from './state.js';
import type { BusinessRepository } from './repository.js';

type DbPool = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
};

type SqlNullable = string | null;

async function getPool(): Promise<DbPool> {
  const { pool } = await import('@mlm-hosting-saas/database');
  return pool;
}

function fullName(firstName: SqlNullable, lastName: SqlNullable) {
  return [firstName || '', lastName || ''].join(' ').trim();
}

type QualificationSpec = {
  activeOrders: number;
  minRevenue: number;
  role: string;
  groupCode: string;
};

function parseQualificationSpec(value: string | null | undefined): QualificationSpec {
  const spec: QualificationSpec = {
    activeOrders: 0,
    minRevenue: 0,
    role: '',
    groupCode: ''
  };

  for (const token of String(value || '')
    .split(/[;,|]/)
    .map((entry) => entry.trim())
    .filter(Boolean)) {
    const activeOrdersMatch = token.match(/^active-orders>=(\d+)$/i);
    if (activeOrdersMatch) {
      spec.activeOrders = Number(activeOrdersMatch[1] || '0');
      continue;
    }

    const revenueMatch = token.match(/^revenue>=(\d+(?:\.\d+)?)$/i);
    if (revenueMatch) {
      spec.minRevenue = Number(revenueMatch[1] || '0');
      continue;
    }

    const roleMatch = token.match(/^role=(.+)$/i);
    if (roleMatch) {
      spec.role = roleMatch[1]?.trim() || '';
      continue;
    }

    const groupMatch = token.match(/^group=(.+)$/i);
    if (groupMatch) {
      spec.groupCode = groupMatch[1]?.trim() || '';
    }
  }

  return spec;
}

async function tenantContext(pool: DbPool) {
  const result = await pool.query<{ id: string }>('SELECT id::text AS id FROM tenants WHERE slug = $1', [
    demoTenant.slug
  ]);
  const tenantId = result.rows[0]?.id;

  if (!tenantId) {
    throw new Error(`Tenant ${demoTenant.slug} is not present in PostgreSQL.`);
  }

  return { tenantId };
}

async function resolveUserIdByEmail(pool: DbPool, email: string) {
  const result = await pool.query<{ id: string }>('SELECT id::text AS id FROM users WHERE email = $1', [
    email
  ]);
  return result.rows[0]?.id || null;
}

async function countExists(
  pool: DbPool,
  tableName: 'members' | 'customers' | 'products',
  tenantId: string,
  id: string
) {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${tableName} WHERE tenant_id = $1 AND id = $2`,
    [tenantId, id]
  );
  return Number(result.rows[0]?.count || '0') > 0;
}

async function listSalesGroupsQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const result = await pool.query<{
    id: string;
    tenantSlug: string;
    name: string;
    code: string;
    region: string;
    managerEmail: string;
    status: 'draft' | 'active';
    notes: string;
  }>(
    `
      SELECT
        sg.id::text AS id,
        t.slug AS "tenantSlug",
        sg.name,
        sg.code,
        sg.region,
        COALESCE(u.email, '') AS "managerEmail",
        sg.status,
        sg.notes
      FROM sales_groups sg
      JOIN tenants t ON t.id = sg.tenant_id
      LEFT JOIN users u ON u.id = sg.manager_user_id
      WHERE sg.tenant_id = $1
      ORDER BY sg.name
    `,
    [tenantId]
  );
  return result.rows;
}

async function listMembersQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const result = await pool.query<{
    id: string;
    tenantSlug: string;
    salesGroupId: string;
    salesGroupName: string;
    firstName: string;
    lastName: string;
    email: string;
    roleTitle: string;
    status: 'prospect' | 'active' | 'paused';
    sponsorMemberId: string | null;
    sponsorFirstName: string | null;
    sponsorLastName: string | null;
  }>(
    `
      SELECT
        m.id::text AS id,
        t.slug AS "tenantSlug",
        m.sales_group_id::text AS "salesGroupId",
        sg.name AS "salesGroupName",
        m.first_name AS "firstName",
        m.last_name AS "lastName",
        m.email,
        m.role_title AS "roleTitle",
        m.status,
        m.sponsor_member_id::text AS "sponsorMemberId",
        sponsor.first_name AS "sponsorFirstName",
        sponsor.last_name AS "sponsorLastName"
      FROM members m
      JOIN tenants t ON t.id = m.tenant_id
      JOIN sales_groups sg ON sg.id = m.sales_group_id
      LEFT JOIN members sponsor ON sponsor.id = m.sponsor_member_id
      WHERE m.tenant_id = $1
      ORDER BY m.last_name, m.first_name
    `,
    [tenantId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    tenantSlug: row.tenantSlug,
    salesGroupId: row.salesGroupId,
    salesGroupName: row.salesGroupName,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    roleTitle: row.roleTitle,
    status: row.status,
    sponsorMemberId: row.sponsorMemberId,
    sponsorName: fullName(row.sponsorFirstName, row.sponsorLastName)
  }));
}

async function listCustomersQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const result = await pool.query<{
    id: string;
    tenantSlug: string;
    ownerMemberId: string;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    status: 'lead' | 'active' | 'past_due' | 'churned';
    monthlyRevenue: string;
    source: string;
    notes: string;
    ownerFirstName: string | null;
    ownerLastName: string | null;
  }>(
    `
      SELECT
        c.id::text AS id,
        t.slug AS "tenantSlug",
        c.owner_member_id::text AS "ownerMemberId",
        c.company_name AS "companyName",
        c.contact_name AS "contactName",
        c.email,
        c.phone,
        c.status,
        c.monthly_revenue::text AS "monthlyRevenue",
        c.source,
        c.notes,
        owner.first_name AS "ownerFirstName",
        owner.last_name AS "ownerLastName"
      FROM customers c
      JOIN tenants t ON t.id = c.tenant_id
      JOIN members owner ON owner.id = c.owner_member_id
      WHERE c.tenant_id = $1
      ORDER BY c.company_name
    `,
    [tenantId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    tenantSlug: row.tenantSlug,
    ownerMemberId: row.ownerMemberId,
    companyName: row.companyName,
    contactName: row.contactName,
    email: row.email,
    phone: row.phone,
    status: row.status,
    monthlyRevenue: Number(row.monthlyRevenue || '0'),
    source: row.source,
    notes: row.notes,
    ownerMemberName: fullName(row.ownerFirstName, row.ownerLastName)
  }));
}

async function listProductsQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const result = await pool.query<{
    id: string;
    tenantSlug: string;
    name: string;
    sku: string;
    billingCycle: 'monthly' | 'annual';
    unitPrice: string;
    commissionableRate: string;
    status: 'active' | 'retired';
  }>(
    `
      SELECT
        p.id::text AS id,
        t.slug AS "tenantSlug",
        p.name,
        p.sku,
        p.billing_cycle AS "billingCycle",
        p.unit_price::text AS "unitPrice",
        p.commissionable_rate::text AS "commissionableRate",
        p.status
      FROM products p
      JOIN tenants t ON t.id = p.tenant_id
      WHERE p.tenant_id = $1
      ORDER BY p.name
    `,
    [tenantId]
  );

  return result.rows.map((row) => ({
    ...row,
    unitPrice: Number(row.unitPrice || '0'),
    commissionableRate: Number(row.commissionableRate || '0')
  }));
}

async function listOrdersQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const result = await pool.query<{
    id: string;
    tenantSlug: string;
    customerId: string;
    customerName: string;
    productId: string;
    productName: string;
    sellingMemberId: string;
    memberFirstName: string | null;
    memberLastName: string | null;
    quantity: number;
    unitPrice: string;
    billingCycle: 'monthly' | 'annual';
    status: 'pending' | 'active' | 'cancelled';
    placedAt: string;
  }>(
    `
      SELECT
        o.id::text AS id,
        t.slug AS "tenantSlug",
        o.customer_id::text AS "customerId",
        c.company_name AS "customerName",
        o.product_id::text AS "productId",
        p.name AS "productName",
        o.selling_member_id::text AS "sellingMemberId",
        m.first_name AS "memberFirstName",
        m.last_name AS "memberLastName",
        o.quantity,
        o.unit_price::text AS "unitPrice",
        o.billing_cycle AS "billingCycle",
        o.status,
        o.placed_at::text AS "placedAt"
      FROM orders o
      JOIN tenants t ON t.id = o.tenant_id
      JOIN customers c ON c.id = o.customer_id
      JOIN products p ON p.id = o.product_id
      JOIN members m ON m.id = o.selling_member_id
      WHERE o.tenant_id = $1
      ORDER BY o.placed_at DESC, o.created_at DESC
    `,
    [tenantId]
  );

  return result.rows.map((row) => {
    const unitPrice = Number(row.unitPrice || '0');
    return {
      id: row.id,
      tenantSlug: row.tenantSlug,
      customerId: row.customerId,
      customerName: row.customerName,
      productId: row.productId,
      productName: row.productName,
      sellingMemberId: row.sellingMemberId,
      unitPrice,
      quantity: row.quantity,
      billingCycle: row.billingCycle,
      status: row.status,
      placedAt: row.placedAt,
      memberName: fullName(row.memberFirstName, row.memberLastName),
      totalAmount: row.quantity * unitPrice
    };
  });
}

async function listCommissionSummaryQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const rules = await listCommissionRules();
  const overrideRule = rules.find((rule) => rule.ruleType === 'override' && rule.levelNumber === 1);
  const levelTwoRule = rules.find((rule) => rule.ruleType === 'override' && rule.levelNumber === 2);
  const levelOneRate = overrideRule?.percentRate ?? 0.05;
  const levelTwoRate = levelTwoRule?.percentRate ?? 0.02;
  const levelOneSpec = parseQualificationSpec(overrideRule?.rankFloor);
  const levelTwoSpec = parseQualificationSpec(levelTwoRule?.rankFloor);
  const result = await pool.query<{
    memberId: string;
    memberName: string;
    sponsorName: string | null;
    activeOrders: string;
    directRevenue: string;
    directCommission: string;
    overrideCommission: string;
    totalCommission: string;
  }>(
    `
      WITH active_orders AS (
        SELECT *
        FROM orders
        WHERE tenant_id = $1 AND status = 'active'
      ),
      direct_totals AS (
        SELECT
          m.id AS member_id,
          COUNT(ao.id)::text AS active_orders,
          COALESCE(SUM(ao.quantity * ao.unit_price), 0)::text AS direct_revenue,
          COALESCE(SUM(ao.quantity * ao.unit_price * p.commissionable_rate), 0)::text AS direct_commission
        FROM members m
        LEFT JOIN active_orders ao ON ao.selling_member_id = m.id
        LEFT JOIN products p ON p.id = ao.product_id
        WHERE m.tenant_id = $1
        GROUP BY m.id
      ),
      level_one_totals AS (
        SELECT
          sponsor.id AS member_id,
          COALESCE(
            SUM(
              CASE
                WHEN COALESCE(sponsor_dt.active_orders::int, 0) >= $4
                  AND COALESCE(sponsor_dt.direct_revenue::numeric, 0) >= $5
                  AND ($6 = '' OR LOWER(sponsor.role_title) = LOWER($6))
                  AND ($7 = '' OR sponsor_group.code = $7)
                THEN ao.quantity * ao.unit_price * $2
                ELSE 0
              END
            ),
            0
          )::text AS level_one_override
        FROM members sponsor
        LEFT JOIN direct_totals sponsor_dt ON sponsor_dt.member_id = sponsor.id
        LEFT JOIN sales_groups sponsor_group ON sponsor_group.id = sponsor.sales_group_id
        LEFT JOIN members seller ON seller.sponsor_member_id = sponsor.id
        LEFT JOIN active_orders ao ON ao.selling_member_id = seller.id
        WHERE sponsor.tenant_id = $1
        GROUP BY sponsor.id
      ),
      level_two_totals AS (
        SELECT
          sponsor.id AS member_id,
          COALESCE(
            SUM(
              CASE
                WHEN COALESCE(sponsor_dt.active_orders::int, 0) >= $8
                  AND COALESCE(sponsor_dt.direct_revenue::numeric, 0) >= $9
                  AND ($10 = '' OR LOWER(sponsor.role_title) = LOWER($10))
                  AND ($11 = '' OR sponsor_group.code = $11)
                THEN ao.quantity * ao.unit_price * $3
                ELSE 0
              END
            ),
            0
          )::text AS level_two_override
        FROM members sponsor
        LEFT JOIN direct_totals sponsor_dt ON sponsor_dt.member_id = sponsor.id
        LEFT JOIN sales_groups sponsor_group ON sponsor_group.id = sponsor.sales_group_id
        LEFT JOIN members first_level ON first_level.sponsor_member_id = sponsor.id
        LEFT JOIN members second_level ON second_level.sponsor_member_id = first_level.id
        LEFT JOIN active_orders ao ON ao.selling_member_id = second_level.id
        WHERE sponsor.tenant_id = $1
        GROUP BY sponsor.id
      )
      SELECT
        m.id::text AS "memberId",
      m.first_name || ' ' || m.last_name AS "memberName",
      CASE
        WHEN sponsor.id IS NULL THEN NULL
        ELSE sponsor.first_name || ' ' || sponsor.last_name
      END AS "sponsorName",
        dt.active_orders AS "activeOrders",
        dt.direct_revenue AS "directRevenue",
        dt.direct_commission AS "directCommission",
        (l1.level_one_override::numeric + l2.level_two_override::numeric)::text AS "overrideCommission",
        (dt.direct_commission::numeric + l1.level_one_override::numeric + l2.level_two_override::numeric)::text AS "totalCommission"
      FROM members m
      JOIN direct_totals dt ON dt.member_id = m.id
      JOIN level_one_totals l1 ON l1.member_id = m.id
      JOIN level_two_totals l2 ON l2.member_id = m.id
      LEFT JOIN members sponsor ON sponsor.id = m.sponsor_member_id
      WHERE m.tenant_id = $1
      ORDER BY (dt.direct_commission::numeric + l1.level_one_override::numeric + l2.level_two_override::numeric) DESC, m.last_name
    `,
    [
      tenantId,
      levelOneRate,
      levelTwoRate,
      levelOneSpec.activeOrders,
      levelOneSpec.minRevenue,
      levelOneSpec.role,
      levelOneSpec.groupCode,
      levelTwoSpec.activeOrders,
      levelTwoSpec.minRevenue,
      levelTwoSpec.role,
      levelTwoSpec.groupCode
    ]
  );

  return result.rows.map((row) => ({
    memberId: row.memberId,
    memberName: row.memberName,
    sponsorName: row.sponsorName || '',
    activeOrders: Number(row.activeOrders || '0'),
    directRevenue: Number(row.directRevenue || '0'),
    directCommission: Number(row.directCommission || '0'),
    overrideCommission: Number(row.overrideCommission || '0'),
    totalCommission: Number(row.totalCommission || '0')
  })) satisfies CommissionSummary[];
}

async function listPayoutBatchesQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const result = await pool.query<{
    id: string;
    periodLabel: string;
    scheduledFor: string;
    status: 'draft' | 'approved' | 'paid' | 'void';
    payeeCount: number;
    totalAmount: string;
    approvedAt: string | null;
    approvedByEmail: string | null;
    paidAt: string | null;
    paidByEmail: string | null;
  }>(
    `
      SELECT
        batch.id::text AS id,
        batch.period_label AS "periodLabel",
        batch.scheduled_for::text AS "scheduledFor",
        batch.status,
        COALESCE(item_stats.payee_count, batch.payee_count) AS "payeeCount",
        COALESCE(item_stats.total_amount::numeric, batch.total_amount)::text AS "totalAmount",
        batch.approved_at::text AS "approvedAt",
        approver.email AS "approvedByEmail",
        batch.paid_at::text AS "paidAt",
        payer.email AS "paidByEmail"
      FROM payout_batches batch
      LEFT JOIN users approver ON approver.id = batch.approved_by_user_id
      LEFT JOIN users payer ON payer.id = batch.paid_by_user_id
      LEFT JOIN (
        SELECT
          batch_id,
          COUNT(*)::integer AS payee_count,
          COALESCE(SUM(total_amount), 0)::numeric AS total_amount
        FROM payout_items
        GROUP BY batch_id
      ) item_stats ON item_stats.batch_id = batch.id
      WHERE batch.tenant_id = $1
      ORDER BY batch.scheduled_for DESC
    `,
    [tenantId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    periodLabel: row.periodLabel,
    scheduledFor: row.scheduledFor,
    status: row.status,
    payeeCount: Number(row.payeeCount || 0),
    totalAmount: Number(row.totalAmount || '0'),
    approvedAt: row.approvedAt,
    approvedByEmail: row.approvedByEmail || '',
    paidAt: row.paidAt,
    paidByEmail: row.paidByEmail || ''
  })) satisfies PayoutBatch[];
}

async function listPayoutItemsQuery(pool: DbPool) {
  const { tenantId } = await tenantContext(pool);
  const result = await pool.query<{
    id: string;
    batchId: string;
    payeeMemberId: string;
    payeeMemberName: string;
    lineLabel: string;
    sourceSummary: string;
    directCommission: string;
    overrideCommission: string;
    totalAmount: string;
    orderCount: number;
    notes: string;
  }>(
    `
      SELECT
        item.id::text AS id,
        item.batch_id::text AS "batchId",
        item.payee_member_id::text AS "payeeMemberId",
        COALESCE(member.first_name || ' ' || member.last_name, '') AS "payeeMemberName",
        item.line_label AS "lineLabel",
        item.source_summary AS "sourceSummary",
        item.direct_commission::text AS "directCommission",
        item.override_commission::text AS "overrideCommission",
        item.total_amount::text AS "totalAmount",
        item.order_count AS "orderCount",
        item.notes
      FROM payout_items item
      JOIN payout_batches batch ON batch.id = item.batch_id
      LEFT JOIN members member ON member.id = item.payee_member_id
      WHERE batch.tenant_id = $1
      ORDER BY batch.scheduled_for DESC, item.total_amount DESC, item.line_label
    `,
    [tenantId]
  );

  return result.rows.map((row) => ({
    ...row,
    directCommission: Number(row.directCommission || '0'),
    overrideCommission: Number(row.overrideCommission || '0'),
    totalAmount: Number(row.totalAmount || '0'),
    orderCount: Number(row.orderCount || '0')
  }));
}

async function updatePayoutBatchStatus(
  pool: DbPool,
  input: { batchId: string; actorEmail: string; status: 'approved' | 'paid' | 'void' | 'draft' }
) {
  const { tenantId } = await tenantContext(pool);
  const actorUserId = await resolveUserIdByEmail(pool, input.actorEmail);

  if (!actorUserId) {
    throw new Error(`Unable to resolve payout actor ${input.actorEmail}.`);
  }

  const current = await pool.query<{ status: 'draft' | 'approved' | 'paid' | 'void' }>(
    'SELECT status FROM payout_batches WHERE tenant_id = $1 AND id = $2',
    [tenantId, input.batchId]
  );
  const currentStatus = current.rows[0]?.status;
  if (!currentStatus) {
    throw new Error('Payout batch not found.');
  }

  if (input.status === 'approved' && currentStatus !== 'draft') {
    throw new Error('Only draft payout batches can be approved.');
  }

  if (input.status === 'paid' && currentStatus !== 'approved') {
    throw new Error('Only approved payout batches can be marked paid.');
  }

  if (input.status === 'void' && currentStatus === 'paid') {
    throw new Error('Paid payout batches cannot be voided.');
  }

  if (input.status === 'draft' && currentStatus !== 'void') {
    throw new Error('Only void payout batches can be reopened.');
  }

  await pool.query(
    `
      UPDATE payout_batches
      SET
        status = $3,
        approved_at = CASE WHEN $3 = 'approved' THEN NOW() WHEN $3 = 'draft' THEN NULL ELSE approved_at END,
        approved_by_user_id = CASE WHEN $3 = 'approved' THEN $4 WHEN $3 = 'draft' THEN NULL ELSE approved_by_user_id END,
        paid_at = CASE WHEN $3 = 'paid' THEN NOW() WHEN $3 = 'draft' THEN NULL ELSE paid_at END,
        paid_by_user_id = CASE WHEN $3 = 'paid' THEN $4 WHEN $3 = 'draft' THEN NULL ELSE paid_by_user_id END,
        updated_at = NOW()
      WHERE tenant_id = $1 AND id = $2
    `,
    [tenantId, input.batchId, input.status, actorUserId]
  );

  const batches = await listPayoutBatchesQuery(pool);
  return batches.find((batch) => batch.id === input.batchId)!;
}

export const postgresBusinessRepository: BusinessRepository = {
  async hasMember(memberId) {
    const pool = await getPool();
    const { tenantId } = await tenantContext(pool);
    return countExists(pool, 'members', tenantId, memberId);
  },
  async hasCustomer(customerId) {
    const pool = await getPool();
    const { tenantId } = await tenantContext(pool);
    return countExists(pool, 'customers', tenantId, customerId);
  },
  async hasProduct(productId) {
    const pool = await getPool();
    const { tenantId } = await tenantContext(pool);
    return countExists(pool, 'products', tenantId, productId);
  },
  async listSalesGroups() {
    const pool = await getPool();
    return listSalesGroupsQuery(pool);
  },
  async addSalesGroup(input) {
    const pool = await getPool();
    const { tenantId } = await tenantContext(pool);
    const managerUserId = input.managerEmail
      ? await resolveUserIdByEmail(pool, input.managerEmail)
      : null;
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO sales_groups (
          id, tenant_id, name, code, region, manager_user_id, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [id, tenantId, input.name, input.code, input.region, managerUserId, input.status, input.notes]
    );

    const rows = await listSalesGroupsQuery(pool);
    return rows.find((row) => row.id === id)!;
  },
  async listMembers() {
    const pool = await getPool();
    return listMembersQuery(pool);
  },
  async addMember(input) {
    const pool = await getPool();
    const { tenantId } = await tenantContext(pool);
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO members (
          id, tenant_id, sales_group_id, sponsor_member_id, first_name, last_name, email, role_title, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        id,
        tenantId,
        input.salesGroupId,
        input.sponsorMemberId,
        input.firstName,
        input.lastName,
        input.email,
        input.roleTitle,
        input.status
      ]
    );

    const rows = await listMembersQuery(pool);
    return rows.find((row) => row.id === id)!;
  },
  async listCustomers() {
    const pool = await getPool();
    return listCustomersQuery(pool);
  },
  async addCustomer(input) {
    const pool = await getPool();
    const { tenantId } = await tenantContext(pool);
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO customers (
          id, tenant_id, owner_member_id, company_name, contact_name, email, phone, status, monthly_revenue, source, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        id,
        tenantId,
        input.ownerMemberId,
        input.companyName,
        input.contactName,
        input.email,
        input.phone,
        input.status,
        input.monthlyRevenue,
        input.source,
        input.notes
      ]
    );

    const rows = await listCustomersQuery(pool);
    return rows.find((row) => row.id === id)!;
  },
  async listProducts() {
    const pool = await getPool();
    return listProductsQuery(pool);
  },
  async listOrders() {
    const pool = await getPool();
    return listOrdersQuery(pool);
  },
  async addOrder(input) {
    const pool = await getPool();
    const { tenantId } = await tenantContext(pool);
    const id = randomUUID();

    await pool.query(
      `
        INSERT INTO orders (
          id, tenant_id, customer_id, product_id, selling_member_id, quantity, unit_price, billing_cycle, status, placed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date)
      `,
      [
        id,
        tenantId,
        input.customerId,
        input.productId,
        input.sellingMemberId,
        input.quantity,
        input.unitPrice,
        input.billingCycle,
        input.status,
        input.placedAt
      ]
    );

    const rows = await listOrdersQuery(pool);
    return rows.find((row) => row.id === id)!;
  },
  async listCommissionSummary() {
    const pool = await getPool();
    return listCommissionSummaryQuery(pool);
  },
  async listPayoutBatches() {
    const pool = await getPool();
    return listPayoutBatchesQuery(pool);
  },
  async listPayoutItems() {
    const pool = await getPool();
    return listPayoutItemsQuery(pool);
  },
  async approvePayoutBatch(batchId, actorEmail) {
    const pool = await getPool();
    return updatePayoutBatchStatus(pool, { batchId, actorEmail, status: 'approved' });
  },
  async markPayoutBatchPaid(batchId, actorEmail) {
    const pool = await getPool();
    return updatePayoutBatchStatus(pool, { batchId, actorEmail, status: 'paid' });
  },
  async voidPayoutBatch(batchId, actorEmail) {
    const pool = await getPool();
    return updatePayoutBatchStatus(pool, { batchId, actorEmail, status: 'void' });
  },
  async reopenPayoutBatch(batchId, actorEmail) {
    const pool = await getPool();
    return updatePayoutBatchStatus(pool, { batchId, actorEmail, status: 'draft' });
  }
};
