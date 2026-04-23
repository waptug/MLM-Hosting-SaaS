import { demoTenant } from './demo-data.js';
import type { BusinessRepository } from './repository.js';

type StringRecord = Record<string, string | null>;

function fullName(firstName: string | null, lastName: string | null) {
  return [firstName || '', lastName || ''].join(' ').trim();
}

async function countExists(tableName: 'members' | 'customers' | 'products', id: string) {
  const { pool } = await import('@mlm-hosting-saas/database');
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${tableName} WHERE id = $1`,
    [id]
  );
  return Number(result.rows[0]?.count || '0') > 0;
}

export const postgresBusinessRepository: BusinessRepository = {
  hasMember(memberId) {
    return countExists('members', memberId);
  },
  hasCustomer(customerId) {
    return countExists('customers', customerId);
  },
  hasProduct(productId) {
    return countExists('products', productId);
  },
  async listSalesGroups() {
    const { pool } = await import('@mlm-hosting-saas/database');
    const result = await pool.query(
      `
        SELECT
          sg.id::text,
          $1::text AS "tenantSlug",
          sg.name,
          sg.code,
          sg.region,
          COALESCE(u.email, '') AS "managerEmail",
          sg.status,
          sg.notes
        FROM sales_groups sg
        LEFT JOIN users u ON u.id = sg.manager_user_id
        ORDER BY sg.name
      `,
      [demoTenant.slug]
    );
    return result.rows;
  },
  async addSalesGroup() {
    throw new Error('PostgreSQL addSalesGroup is not implemented yet.');
  },
  async listMembers() {
    const { pool } = await import('@mlm-hosting-saas/database');
    const result = await pool.query<
      StringRecord & {
        status: 'prospect' | 'active' | 'paused';
      }
    >(
      `
        SELECT
          m.id::text,
          $1::text AS "tenantSlug",
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
        JOIN sales_groups sg ON sg.id = m.sales_group_id
        LEFT JOIN members sponsor ON sponsor.id = m.sponsor_member_id
        ORDER BY m.last_name, m.first_name
      `,
      [demoTenant.slug]
    );

    return result.rows.map((row) => ({
      id: row.id || '',
      tenantSlug: row.tenantSlug || demoTenant.slug,
      salesGroupId: row.salesGroupId || '',
      salesGroupName: row.salesGroupName || '',
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      roleTitle: row.roleTitle || '',
      status: row.status,
      sponsorMemberId: row.sponsorMemberId,
      sponsorName: fullName(row.sponsorFirstName, row.sponsorLastName)
    }));
  },
  async addMember() {
    throw new Error('PostgreSQL addMember is not implemented yet.');
  },
  async listCustomers() {
    const { pool } = await import('@mlm-hosting-saas/database');
    const result = await pool.query<StringRecord & { monthlyRevenue: string }>(
      `
        SELECT
          c.id::text,
          $1::text AS "tenantSlug",
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
        JOIN members owner ON owner.id = c.owner_member_id
        ORDER BY c.company_name
      `,
      [demoTenant.slug]
    );

    return result.rows.map((row) => ({
      id: row.id || '',
      tenantSlug: row.tenantSlug || demoTenant.slug,
      ownerMemberId: row.ownerMemberId || '',
      companyName: row.companyName || '',
      contactName: row.contactName || '',
      email: row.email || '',
      phone: row.phone || '',
      status: (row.status || 'lead') as 'lead' | 'active' | 'past_due' | 'churned',
      monthlyRevenue: Number(row.monthlyRevenue || '0'),
      source: row.source || '',
      notes: row.notes || '',
      ownerMemberName: fullName(row.ownerFirstName, row.ownerLastName)
    }));
  },
  async addCustomer() {
    throw new Error('PostgreSQL addCustomer is not implemented yet.');
  },
  async listProducts() {
    const { pool } = await import('@mlm-hosting-saas/database');
    const result = await pool.query<StringRecord & { unitPrice: string; commissionableRate: string }>(
      `
        SELECT
          id::text,
          $1::text AS "tenantSlug",
          name,
          sku,
          billing_cycle AS "billingCycle",
          unit_price::text AS "unitPrice",
          commissionable_rate::text AS "commissionableRate",
          status
        FROM products
        ORDER BY name
      `,
      [demoTenant.slug]
    );

    return result.rows.map((row) => ({
      id: row.id || '',
      tenantSlug: row.tenantSlug || demoTenant.slug,
      name: row.name || '',
      sku: row.sku || '',
      billingCycle: (row.billingCycle || 'monthly') as 'monthly' | 'annual',
      unitPrice: Number(row.unitPrice || '0'),
      commissionableRate: Number(row.commissionableRate || '0'),
      status: (row.status || 'active') as 'active' | 'retired'
    }));
  },
  async listOrders() {
    const { pool } = await import('@mlm-hosting-saas/database');
    const result = await pool.query<StringRecord & { quantity: number; unitPrice: string }>(
      `
        SELECT
          o.id::text,
          $1::text AS "tenantSlug",
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
        JOIN customers c ON c.id = o.customer_id
        JOIN products p ON p.id = o.product_id
        JOIN members m ON m.id = o.selling_member_id
        ORDER BY o.placed_at DESC, o.created_at DESC
      `,
      [demoTenant.slug]
    );

    return result.rows.map((row) => ({
      id: row.id || '',
      tenantSlug: row.tenantSlug || demoTenant.slug,
      customerId: row.customerId || '',
      customerName: row.customerName || '',
      productId: row.productId || '',
      productName: row.productName || '',
      sellingMemberId: row.sellingMemberId || '',
      memberName: fullName(row.memberFirstName, row.memberLastName),
      quantity: row.quantity,
      unitPrice: Number(row.unitPrice || '0'),
      totalAmount: row.quantity * Number(row.unitPrice || '0'),
      billingCycle: (row.billingCycle || 'monthly') as 'monthly' | 'annual',
      status: (row.status || 'pending') as 'pending' | 'active' | 'cancelled',
      placedAt: row.placedAt || ''
    }));
  },
  async addOrder() {
    throw new Error('PostgreSQL addOrder is not implemented yet.');
  },
  async listCommissionSummary() {
    throw new Error('PostgreSQL listCommissionSummary is not implemented yet.');
  },
  async listPayoutBatches() {
    throw new Error('PostgreSQL listPayoutBatches is not implemented yet.');
  }
};
