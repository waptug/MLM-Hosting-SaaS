import { randomUUID } from 'node:crypto';
import type { RoleKey } from '../../../packages/auth/src/model.js';
import type { AuthenticatedUser } from '../../../packages/auth/src/model.js';
import { demoTenant } from './demo-data.js';

export type TenantSetup = {
  slug: string;
  name: string;
  themePreset: string;
  status: 'draft' | 'active';
  ownerEmail: string;
  supportEmail: string;
  brandLabel: string;
  primaryDomain: string;
};

export type SalesGroup = {
  id: string;
  tenantSlug: string;
  name: string;
  code: string;
  region: string;
  managerEmail: string;
  status: 'draft' | 'active';
  notes: string;
};

export type Member = {
  id: string;
  tenantSlug: string;
  salesGroupId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  status: 'prospect' | 'active' | 'paused';
  sponsorMemberId: string | null;
};

export type Customer = {
  id: string;
  tenantSlug: string;
  ownerMemberId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'lead' | 'active' | 'past_due' | 'churned';
  monthlyRevenue: number;
  source: string;
  notes: string;
};

export type Product = {
  id: string;
  tenantSlug: string;
  name: string;
  sku: string;
  billingCycle: 'monthly' | 'annual';
  unitPrice: number;
  commissionableRate: number;
  status: 'active' | 'retired';
};

export type Order = {
  id: string;
  tenantSlug: string;
  customerId: string;
  productId: string;
  sellingMemberId: string;
  quantity: number;
  unitPrice: number;
  billingCycle: 'monthly' | 'annual';
  status: 'pending' | 'active' | 'cancelled';
  placedAt: string;
};

export type CommissionSummary = {
  memberId: string;
  memberName: string;
  sponsorName: string;
  activeOrders: number;
  directRevenue: number;
  directCommission: number;
  overrideCommission: number;
  totalCommission: number;
};

export type PayoutBatch = {
  id: string;
  periodLabel: string;
  scheduledFor: string;
  status: 'draft' | 'approved' | 'paid';
  payeeCount: number;
  totalAmount: number;
  approvedAt?: string | null;
  approvedByEmail?: string;
  paidAt?: string | null;
  paidByEmail?: string;
};

export type AuditLogEntry = {
  id: string;
  actorEmail: string;
  actionKey: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
};

export type TenantInvitation = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleKey;
  invitedByEmail: string;
  status: 'pending' | 'accepted' | 'revoked';
  expiresAt: string;
  createdAt: string;
  acceptanceToken?: string;
};

export type EmailDeliveryLog = {
  id: string;
  recipientEmail: string;
  deliveryType: 'invitation' | 'password_reset';
  subjectLine: string;
  deliveryStatus: 'queued' | 'sent' | 'failed';
  tokenPreview: string;
  relatedEntityType: string;
  relatedEntityId: string;
  createdAt: string;
};

type DatabasePool = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
};

async function getPool(): Promise<DatabasePool> {
  const { pool } = await import('@mlm-hosting-saas/database');
  return pool;
}

async function tenantId(pool: DatabasePool) {
  const result = await pool.query<{ id: string }>('SELECT id::text AS id FROM tenants WHERE slug = $1', [
    demoTenant.slug
  ]);
  const id = result.rows[0]?.id;

  if (!id) {
    throw new Error(`Tenant ${demoTenant.slug} is not present in PostgreSQL.`);
  }

  return id;
}

export async function getTenantSetup() {
  const pool = await getPool();
  const result = await pool.query<{
    slug: string;
    name: string;
    themePreset: string;
    status: 'draft' | 'active';
    ownerEmail: string | null;
    supportEmail: string;
    brandLabel: string;
    primaryDomain: string;
  }>(
    `
      SELECT
        t.slug,
        t.name,
        t.theme_preset AS "themePreset",
        t.status,
        owner.email AS "ownerEmail",
        t.support_email AS "supportEmail",
        t.brand_label AS "brandLabel",
        t.primary_domain AS "primaryDomain"
      FROM tenants t
      LEFT JOIN users owner ON owner.id = t.owner_user_id
      WHERE t.slug = $1
    `,
    [demoTenant.slug]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error(`Tenant setup for ${demoTenant.slug} was not found.`);
  }

  return {
    slug: row.slug,
    name: row.name,
    themePreset: row.themePreset,
    status: row.status,
    ownerEmail: row.ownerEmail || '',
    supportEmail: row.supportEmail,
    brandLabel: row.brandLabel,
    primaryDomain: row.primaryDomain
  } satisfies TenantSetup;
}

export async function updateTenantSetup(input: Partial<TenantSetup>) {
  const pool = await getPool();
  const id = await tenantId(pool);
  const current = await getTenantSetup();

  const nextSetup: TenantSetup = {
    slug: input.slug || current.slug,
    name: input.name || current.name,
    themePreset: input.themePreset || current.themePreset,
    status: input.status || current.status,
    ownerEmail: input.ownerEmail || current.ownerEmail,
    supportEmail: input.supportEmail || current.supportEmail,
    brandLabel: input.brandLabel || current.brandLabel,
    primaryDomain: input.primaryDomain || current.primaryDomain
  };

  let ownerUserId: string | null = null;
  if (nextSetup.ownerEmail) {
    const ownerResult = await pool.query<{ id: string }>('SELECT id::text AS id FROM users WHERE email = $1', [
      nextSetup.ownerEmail
    ]);
    ownerUserId = ownerResult.rows[0]?.id || null;
  }

  await pool.query(
    `
      UPDATE tenants
      SET
        slug = $2,
        name = $3,
        theme_preset = $4,
        status = $5,
        owner_user_id = $6,
        support_email = $7,
        brand_label = $8,
        primary_domain = $9,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      nextSetup.slug,
      nextSetup.name,
      nextSetup.themePreset,
      nextSetup.status,
      ownerUserId,
      nextSetup.supportEmail,
      nextSetup.brandLabel,
      nextSetup.primaryDomain
    ]
  );

  demoTenant.slug = nextSetup.slug;
  demoTenant.name = nextSetup.name;
  demoTenant.themePreset = nextSetup.themePreset;
  demoTenant.status = nextSetup.status;

  return getTenantSetup();
}

export async function listTenantUsers(): Promise<Array<AuthenticatedUser & { role: RoleKey }>> {
  const pool = await getPool();
  const result = await pool.query<AuthenticatedUser & { role: RoleKey }>(
    `
      SELECT
        u.id::text AS id,
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        tu.role_key AS role
      FROM tenant_users tu
      JOIN tenants t ON t.id = tu.tenant_id
      JOIN users u ON u.id = tu.user_id
      WHERE t.slug = $1
      ORDER BY u.last_name, u.first_name, tu.role_key
    `,
    [demoTenant.slug]
  );

  return result.rows;
}

export async function addTenantUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  role: RoleKey;
}) {
  const pool = await getPool();
  const id = await tenantId(pool);
  const normalizedEmail = input.email.trim().toLowerCase();
  let userId: string | null = null;

  const existingUserResult = await pool.query<{ id: string }>('SELECT id::text AS id FROM users WHERE email = $1', [
    normalizedEmail
  ]);
  userId = existingUserResult.rows[0]?.id || null;

  if (userId) {
    await pool.query(
      `
        UPDATE users
        SET
          first_name = $2,
          last_name = $3,
          updated_at = NOW()
        WHERE id = $1
      `,
      [userId, input.firstName.trim(), input.lastName.trim()]
    );
  } else {
    userId = (await pool.query<{ id: string }>(
      `
        INSERT INTO users (id, email, password_hash, first_name, last_name)
        VALUES ($1, $2, 'pending-password', $3, $4)
        RETURNING id::text AS id
      `,
      [randomUUID(), normalizedEmail, input.firstName.trim(), input.lastName.trim()]
    )).rows[0]?.id || null;
  }

  if (!userId) {
    throw new Error(`Unable to create or update user ${normalizedEmail}.`);
  }

  await pool.query('DELETE FROM tenant_users WHERE tenant_id = $1 AND user_id = $2', [id, userId]);
  await pool.query(
    `
      INSERT INTO tenant_users (id, tenant_id, user_id, role_key)
      VALUES ($1, $2, $3, $4)
    `,
    [randomUUID(), id, userId, input.role]
  );

  const users = await listTenantUsers();
  return users.find((user) => user.email === normalizedEmail)!;
}

export async function listAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<AuditLogEntry>(
    `
      SELECT
        id::text AS id,
        actor_email AS "actorEmail",
        action_key AS "actionKey",
        entity_type AS "entityType",
        entity_id AS "entityId",
        summary,
        created_at::text AS "createdAt"
      FROM audit_logs
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [id, limit]
  );

  return result.rows;
}

export async function recordAuditLog(input: {
  actorEmail?: string | null;
  actionKey: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  details?: Record<string, unknown>;
}) {
  const pool = await getPool();
  const id = await tenantId(pool);
  const normalizedActorEmail = (input.actorEmail || '').trim().toLowerCase();

  let actorUserId: string | null = null;
  if (normalizedActorEmail) {
    const actorResult = await pool.query<{ id: string }>('SELECT id::text AS id FROM users WHERE email = $1', [
      normalizedActorEmail
    ]);
    actorUserId = actorResult.rows[0]?.id || null;
  }

  await pool.query(
    `
      INSERT INTO audit_logs (
        id,
        tenant_id,
        actor_user_id,
        actor_email,
        action_key,
        entity_type,
        entity_id,
        summary,
        details_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
    `,
    [
      randomUUID(),
      id,
      actorUserId,
      normalizedActorEmail,
      input.actionKey,
      input.entityType,
      input.entityId || '',
      input.summary,
      JSON.stringify(input.details || {})
    ]
  );
}

export async function listTenantInvitations(limit = 50): Promise<TenantInvitation[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<TenantInvitation>(
    `
      SELECT
        invite.id::text AS id,
        invite.email,
        invite.first_name AS "firstName",
        invite.last_name AS "lastName",
        invite.role_key AS role,
        COALESCE(inviter.email, '') AS "invitedByEmail",
        invite.status,
        invite.expires_at::text AS "expiresAt",
        invite.created_at::text AS "createdAt",
        invite.invitation_token AS "acceptanceToken"
      FROM tenant_invitations invite
      LEFT JOIN users inviter ON inviter.id = invite.invited_by_user_id
      WHERE invite.tenant_id = $1
      ORDER BY invite.created_at DESC
      LIMIT $2
    `,
    [id, limit]
  );

  return result.rows;
}

export async function createTenantInvitation(input: {
  actorEmail?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleKey;
}) {
  const pool = await getPool();
  const id = await tenantId(pool);
  const normalizedEmail = input.email.trim().toLowerCase();
  const actorEmail = (input.actorEmail || '').trim().toLowerCase();

  const existingPending = await pool.query<{ id: string }>(
    `
      SELECT id::text AS id
      FROM tenant_invitations
      WHERE tenant_id = $1 AND email = $2 AND status = 'pending'
      LIMIT 1
    `,
    [id, normalizedEmail]
  );

  if (existingPending.rows[0]?.id) {
    throw new Error(`A pending invitation already exists for ${normalizedEmail}.`);
  }

  let invitedByUserId: string | null = null;
  if (actorEmail) {
    const inviterResult = await pool.query<{ id: string }>('SELECT id::text AS id FROM users WHERE email = $1', [actorEmail]);
    invitedByUserId = inviterResult.rows[0]?.id || null;
  }

  const invitationId = randomUUID();
  const invitationToken = randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  await pool.query(
    `
      INSERT INTO tenant_invitations (
        id,
        tenant_id,
        invited_by_user_id,
        email,
        first_name,
        last_name,
        role_key,
        invitation_token,
        status,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
    `,
    [
      invitationId,
      id,
      invitedByUserId,
      normalizedEmail,
      input.firstName.trim(),
      input.lastName.trim(),
      input.role,
      invitationToken,
      expiresAt
    ]
  );

  const invitations = await listTenantInvitations();
  return {
    ...invitations.find((invitation) => invitation.id === invitationId)!,
    acceptanceToken: invitationToken
  };
}

export async function listEmailDeliveryLogs(limit = 50): Promise<EmailDeliveryLog[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<EmailDeliveryLog>(
    `
      SELECT
        id::text AS id,
        recipient_email AS "recipientEmail",
        delivery_type AS "deliveryType",
        subject_line AS "subjectLine",
        delivery_status AS "deliveryStatus",
        token_preview AS "tokenPreview",
        related_entity_type AS "relatedEntityType",
        related_entity_id AS "relatedEntityId",
        created_at::text AS "createdAt"
      FROM email_delivery_logs
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [id, limit]
  );

  return result.rows;
}

export async function recordEmailDelivery(input: {
  recipientEmail: string;
  deliveryType: 'invitation' | 'password_reset';
  subjectLine: string;
  deliveryStatus?: 'queued' | 'sent' | 'failed';
  tokenPreview?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}) {
  const pool = await getPool();
  const id = await tenantId(pool);
  const deliveryId = randomUUID();

  await pool.query(
    `
      INSERT INTO email_delivery_logs (
        id,
        tenant_id,
        recipient_email,
        delivery_type,
        subject_line,
        delivery_status,
        token_preview,
        related_entity_type,
        related_entity_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      deliveryId,
      id,
      input.recipientEmail.trim().toLowerCase(),
      input.deliveryType,
      input.subjectLine,
      input.deliveryStatus || 'sent',
      input.tokenPreview || '',
      input.relatedEntityType || '',
      input.relatedEntityId || ''
    ]
  );

  const logs = await listEmailDeliveryLogs();
  return logs.find((entry) => entry.id === deliveryId)!;
}
