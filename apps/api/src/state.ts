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
  logoUrl: string;
  emailFromName: string;
  emailReplyTo: string;
  emailFooter: string;
};

export type DeploymentSettings = {
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  databasePath: string;
  appRootPath: string;
  backupPath: string;
  logsPath: string;
  publicUrl: string;
  apiUrl: string;
  trustedOrigins: string;
  sessionCookieDomain: string;
  backupRetentionDays: number;
  notes: string;
};

export type TenantSubscription = {
  id: string;
  tenantId: string;
  planKey: string;
  planName: string;
  billingInterval: 'monthly' | 'annual';
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  seatLimit: number;
  pricePerPeriod: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
};

export type BillingInvoice = {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  periodLabel: string;
  issuedAt: string;
  dueAt: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  amountDue: number;
  amountPaid: number;
  balanceDue: number;
  notes: string;
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
  status: 'draft' | 'approved' | 'paid' | 'void';
  payeeCount: number;
  totalAmount: number;
  approvedAt?: string | null;
  approvedByEmail?: string;
  paidAt?: string | null;
  paidByEmail?: string;
};

export type PayoutItem = {
  id: string;
  batchId: string;
  payeeMemberId: string;
  payeeMemberName: string;
  lineLabel: string;
  sourceSummary: string;
  directCommission: number;
  overrideCommission: number;
  totalAmount: number;
  orderCount: number;
  notes: string;
};

export type CommissionSnapshot = {
  id: string;
  batchId: string;
  memberId: string;
  memberName: string;
  sponsorName: string;
  activeOrders: number;
  directRevenue: number;
  directCommission: number;
  overrideCommission: number;
  totalCommission: number;
  sourceLabel: string;
  notes: string;
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

export type CommissionPlanVersion = {
  id: string;
  planName: string;
  versionNumber: number;
  status: 'active' | 'draft' | 'retired';
  effectiveFrom: string;
  notes: string;
};

export type CommissionRule = {
  id: string;
  planVersionId: string;
  ruleKey: string;
  ruleLabel: string;
  ruleType: 'direct' | 'override' | 'workflow' | 'qualification';
  levelNumber: number;
  percentRate: number;
  fixedAmount: number;
  rankFloor: string;
  notes: string;
};

type DatabasePool = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
};

async function getPool(): Promise<DatabasePool> {
  const { pool } = await import('@mlm-hosting-saas/database');
  return pool;
}

function blankDeploymentSettings(): DeploymentSettings {
  return {
    databaseHost: '',
    databasePort: 5432,
    databaseName: '',
    databaseUser: '',
    databasePath: '',
    appRootPath: '',
    backupPath: '',
    logsPath: '',
    publicUrl: '',
    apiUrl: '',
    trustedOrigins: '',
    sessionCookieDomain: '',
    backupRetentionDays: 7,
    notes: ''
  };
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
    logoUrl: string;
    emailFromName: string;
    emailReplyTo: string;
    emailFooter: string;
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
        t.primary_domain AS "primaryDomain",
        t.logo_url AS "logoUrl",
        t.email_from_name AS "emailFromName",
        t.email_reply_to AS "emailReplyTo",
        t.email_footer AS "emailFooter"
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
    primaryDomain: row.primaryDomain,
    logoUrl: row.logoUrl,
    emailFromName: row.emailFromName,
    emailReplyTo: row.emailReplyTo,
    emailFooter: row.emailFooter
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
    primaryDomain: input.primaryDomain || current.primaryDomain,
    logoUrl: input.logoUrl || current.logoUrl,
    emailFromName: input.emailFromName || current.emailFromName,
    emailReplyTo: input.emailReplyTo || current.emailReplyTo,
    emailFooter: input.emailFooter || current.emailFooter
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
        logo_url = $10,
        email_from_name = $11,
        email_reply_to = $12,
        email_footer = $13,
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
      nextSetup.primaryDomain,
      nextSetup.logoUrl,
      nextSetup.emailFromName,
      nextSetup.emailReplyTo,
      nextSetup.emailFooter
    ]
  );

  demoTenant.slug = nextSetup.slug;
  demoTenant.name = nextSetup.name;
  demoTenant.themePreset = nextSetup.themePreset;
  demoTenant.status = nextSetup.status;

  return getTenantSetup();
}

export async function getDeploymentSettings(): Promise<DeploymentSettings> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<{
    databaseHost: string;
    databasePort: number;
    databaseName: string;
    databaseUser: string;
    databasePath: string;
    appRootPath: string;
    backupPath: string;
    logsPath: string;
    publicUrl: string;
    apiUrl: string;
    trustedOrigins: string;
    sessionCookieDomain: string;
    backupRetentionDays: number;
    notes: string;
  }>(
    `
      SELECT
        database_host AS "databaseHost",
        database_port AS "databasePort",
        database_name AS "databaseName",
        database_user AS "databaseUser",
        database_path AS "databasePath",
        app_root_path AS "appRootPath",
        backup_path AS "backupPath",
        logs_path AS "logsPath",
        public_url AS "publicUrl",
        api_url AS "apiUrl",
        trusted_origins AS "trustedOrigins",
        session_cookie_domain AS "sessionCookieDomain",
        backup_retention_days AS "backupRetentionDays",
        notes
      FROM tenant_deployment_settings
      WHERE tenant_id = $1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row) {
    return blankDeploymentSettings();
  }

  return {
    databaseHost: row.databaseHost,
    databasePort: Number(row.databasePort || 5432),
    databaseName: row.databaseName,
    databaseUser: row.databaseUser,
    databasePath: row.databasePath,
    appRootPath: row.appRootPath,
    backupPath: row.backupPath,
    logsPath: row.logsPath,
    publicUrl: row.publicUrl,
    apiUrl: row.apiUrl,
    trustedOrigins: row.trustedOrigins,
    sessionCookieDomain: row.sessionCookieDomain,
    backupRetentionDays: Number(row.backupRetentionDays || 7),
    notes: row.notes
  };
}

export async function updateDeploymentSettings(input: Partial<DeploymentSettings>) {
  const pool = await getPool();
  const id = await tenantId(pool);
  const current = await getDeploymentSettings();

  const nextSettings: DeploymentSettings = {
    databaseHost: input.databaseHost ?? current.databaseHost,
    databasePort: Number(input.databasePort ?? current.databasePort ?? 5432),
    databaseName: input.databaseName ?? current.databaseName,
    databaseUser: input.databaseUser ?? current.databaseUser,
    databasePath: input.databasePath ?? current.databasePath,
    appRootPath: input.appRootPath ?? current.appRootPath,
    backupPath: input.backupPath ?? current.backupPath,
    logsPath: input.logsPath ?? current.logsPath,
    publicUrl: input.publicUrl ?? current.publicUrl,
    apiUrl: input.apiUrl ?? current.apiUrl,
    trustedOrigins: input.trustedOrigins ?? current.trustedOrigins,
    sessionCookieDomain: input.sessionCookieDomain ?? current.sessionCookieDomain,
    backupRetentionDays: Number(input.backupRetentionDays ?? current.backupRetentionDays ?? 7),
    notes: input.notes ?? current.notes
  };

  await pool.query(
    `
      INSERT INTO tenant_deployment_settings (
        id,
        tenant_id,
        database_host,
        database_port,
        database_name,
        database_user,
        database_path,
        app_root_path,
        backup_path,
        logs_path,
        public_url,
        api_url,
        trusted_origins,
        session_cookie_domain,
        backup_retention_days,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (tenant_id) DO UPDATE SET
        database_host = EXCLUDED.database_host,
        database_port = EXCLUDED.database_port,
        database_name = EXCLUDED.database_name,
        database_user = EXCLUDED.database_user,
        database_path = EXCLUDED.database_path,
        app_root_path = EXCLUDED.app_root_path,
        backup_path = EXCLUDED.backup_path,
        logs_path = EXCLUDED.logs_path,
        public_url = EXCLUDED.public_url,
        api_url = EXCLUDED.api_url,
        trusted_origins = EXCLUDED.trusted_origins,
        session_cookie_domain = EXCLUDED.session_cookie_domain,
        backup_retention_days = EXCLUDED.backup_retention_days,
        notes = EXCLUDED.notes,
        updated_at = NOW()
    `,
    [
      randomUUID(),
      id,
      nextSettings.databaseHost,
      nextSettings.databasePort,
      nextSettings.databaseName,
      nextSettings.databaseUser,
      nextSettings.databasePath,
      nextSettings.appRootPath,
      nextSettings.backupPath,
      nextSettings.logsPath,
      nextSettings.publicUrl,
      nextSettings.apiUrl,
      nextSettings.trustedOrigins,
      nextSettings.sessionCookieDomain,
      nextSettings.backupRetentionDays,
      nextSettings.notes
    ]
  );

  return getDeploymentSettings();
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

export async function listPayoutHistory(batchId: string, limit = 25): Promise<AuditLogEntry[]> {
  const entries = await listAuditLogs(limit);
  return entries.filter((entry) => entry.entityType === 'payout_batch' && entry.entityId === batchId);
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
  expiresInDays?: number;
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
  const expiresInDays = Math.max(1, Math.min(90, Number(input.expiresInDays || 7)));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * expiresInDays).toISOString();

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

export async function revokeTenantInvitation(invitationId: string) {
  const pool = await getPool();
  const id = await tenantId(pool);

  const current = await pool.query<{ status: 'pending' | 'accepted' | 'revoked'; email: string }>(
    'SELECT status, email FROM tenant_invitations WHERE tenant_id = $1 AND id = $2 LIMIT 1',
    [id, invitationId]
  );
  const row = current.rows[0];
  if (!row) {
    throw new Error('Invitation not found.');
  }

  if (row.status !== 'pending') {
    throw new Error('Only pending invitations can be revoked.');
  }

  await pool.query(
    `
      UPDATE tenant_invitations
      SET
        status = 'revoked'
      WHERE tenant_id = $1 AND id = $2
    `,
    [id, invitationId]
  );

  const invitations = await listTenantInvitations();
  return invitations.find((invitation) => invitation.id === invitationId)!;
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

export async function listCommissionPlans(): Promise<CommissionPlanVersion[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<CommissionPlanVersion>(
    `
      SELECT
        id::text AS id,
        plan_name AS "planName",
        version_number AS "versionNumber",
        status,
        effective_from::text AS "effectiveFrom",
        notes
      FROM commission_plan_versions
      WHERE tenant_id = $1
      ORDER BY plan_name, version_number DESC
    `,
    [id]
  );

  return result.rows;
}

export async function listCommissionRules(): Promise<CommissionRule[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<CommissionRule>(
    `
      SELECT
        rule.id::text AS id,
        rule.plan_version_id::text AS "planVersionId",
        rule.rule_key AS "ruleKey",
        rule.rule_label AS "ruleLabel",
        rule.rule_type AS "ruleType",
        rule.level_number AS "levelNumber",
        rule.percent_rate::text AS "percentRate",
        rule.fixed_amount::text AS "fixedAmount",
        rule.rank_floor AS "rankFloor",
        rule.notes
      FROM commission_rules rule
      JOIN commission_plan_versions plan ON plan.id = rule.plan_version_id
      WHERE plan.tenant_id = $1
      ORDER BY plan.plan_name, plan.version_number DESC, rule.rule_type, rule.level_number
    `,
    [id]
  );

  return result.rows.map((row) => ({
    ...row,
    percentRate: Number(row.percentRate || '0'),
    fixedAmount: Number(row.fixedAmount || '0')
  }));
}

export async function listPayoutItems(): Promise<PayoutItem[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<PayoutItem>(
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
    [id]
  );

  return result.rows.map((row) => ({
    ...row,
    directCommission: Number(row.directCommission || '0'),
    overrideCommission: Number(row.overrideCommission || '0'),
    totalAmount: Number(row.totalAmount || '0'),
    orderCount: Number(row.orderCount || '0')
  }));
}

export async function listCommissionSnapshots(): Promise<CommissionSnapshot[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<CommissionSnapshot>(
    `
      SELECT
        snap.id::text AS id,
        snap.batch_id::text AS "batchId",
        snap.member_id::text AS "memberId",
        snap.member_name AS "memberName",
        snap.sponsor_name AS "sponsorName",
        snap.active_orders AS "activeOrders",
        snap.direct_revenue::text AS "directRevenue",
        snap.direct_commission::text AS "directCommission",
        snap.override_commission::text AS "overrideCommission",
        snap.total_commission::text AS "totalCommission",
        snap.source_label AS "sourceLabel",
        snap.notes
      FROM commission_snapshots snap
      JOIN payout_batches batch ON batch.id = snap.batch_id
      WHERE batch.tenant_id = $1
      ORDER BY batch.scheduled_for DESC, snap.total_commission DESC, snap.member_name
    `,
    [id]
  );

  return result.rows.map((row) => ({
    ...row,
    activeOrders: Number(row.activeOrders || '0'),
    directRevenue: Number(row.directRevenue || '0'),
    directCommission: Number(row.directCommission || '0'),
    overrideCommission: Number(row.overrideCommission || '0'),
    totalCommission: Number(row.totalCommission || '0')
  }));
}

export async function getBillingSubscription(): Promise<TenantSubscription> {
  return getTenantSubscription();
}

export async function listBillingInvoiceRecords(): Promise<BillingInvoice[]> {
  return listBillingInvoices();
}

export async function updateBillingSubscription(input: Partial<TenantSubscription>) {
  return updateTenantSubscription(input);
}

export async function markInvoicePaid(invoiceId: string, actorEmail: string) {
  return markBillingInvoicePaid(invoiceId, actorEmail);
}

export async function getTenantSubscription(): Promise<TenantSubscription> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<TenantSubscription>(
    `
      SELECT
        id::text AS id,
        tenant_id::text AS "tenantId",
        plan_key AS "planKey",
        plan_name AS "planName",
        billing_interval AS "billingInterval",
        status,
        seat_limit AS "seatLimit",
        price_per_period::text AS "pricePerPeriod",
        currency,
        current_period_start::text AS "currentPeriodStart",
        current_period_end::text AS "currentPeriodEnd",
        trial_ends_at::text AS "trialEndsAt",
        cancel_at_period_end AS "cancelAtPeriodEnd"
      FROM tenant_subscriptions
      WHERE tenant_id = $1
      LIMIT 1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error(`Subscription for tenant ${demoTenant.slug} was not found.`);
  }

  return {
    ...row,
    seatLimit: Number(row.seatLimit || '0'),
    pricePerPeriod: Number(row.pricePerPeriod || '0')
  };
}

export async function updateTenantSubscription(input: Partial<TenantSubscription>) {
  const pool = await getPool();
  const id = await tenantId(pool);
  const current = await getTenantSubscription();

  const nextSubscription: TenantSubscription = {
    ...current,
    planKey: input.planKey || current.planKey,
    planName: input.planName || current.planName,
    billingInterval: input.billingInterval || current.billingInterval,
    status: input.status || current.status,
    seatLimit: input.seatLimit ?? current.seatLimit,
    pricePerPeriod: input.pricePerPeriod ?? current.pricePerPeriod,
    currency: input.currency || current.currency,
    currentPeriodStart: input.currentPeriodStart || current.currentPeriodStart,
    currentPeriodEnd: input.currentPeriodEnd || current.currentPeriodEnd,
    trialEndsAt: input.trialEndsAt === undefined ? current.trialEndsAt : input.trialEndsAt,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? current.cancelAtPeriodEnd
  };

  await pool.query(
    `
      UPDATE tenant_subscriptions
      SET
        plan_key = $2,
        plan_name = $3,
        billing_interval = $4,
        status = $5,
        seat_limit = $6,
        price_per_period = $7,
        currency = $8,
        current_period_start = $9,
        current_period_end = $10,
        trial_ends_at = $11,
        cancel_at_period_end = $12,
        updated_at = NOW()
      WHERE tenant_id = $1
    `,
    [
      id,
      nextSubscription.planKey,
      nextSubscription.planName,
      nextSubscription.billingInterval,
      nextSubscription.status,
      nextSubscription.seatLimit,
      nextSubscription.pricePerPeriod,
      nextSubscription.currency,
      nextSubscription.currentPeriodStart,
      nextSubscription.currentPeriodEnd,
      nextSubscription.trialEndsAt,
      nextSubscription.cancelAtPeriodEnd
    ]
  );

  return getTenantSubscription();
}

export async function listBillingInvoices(): Promise<BillingInvoice[]> {
  const pool = await getPool();
  const id = await tenantId(pool);
  const result = await pool.query<BillingInvoice>(
    `
      SELECT
        id::text AS id,
        subscription_id::text AS "subscriptionId",
        invoice_number AS "invoiceNumber",
        period_label AS "periodLabel",
        issued_at::text AS "issuedAt",
        due_at::text AS "dueAt",
        status,
        amount_due::text AS "amountDue",
        amount_paid::text AS "amountPaid",
        balance_due::text AS "balanceDue",
        notes
      FROM billing_invoices
      WHERE tenant_id = $1
      ORDER BY issued_at DESC
    `,
    [id]
  );

  return result.rows.map((row) => ({
    ...row,
    amountDue: Number(row.amountDue || '0'),
    amountPaid: Number(row.amountPaid || '0'),
    balanceDue: Number(row.balanceDue || '0')
  }));
}

export async function markBillingInvoicePaid(invoiceId: string, actorEmail: string) {
  const pool = await getPool();
  const tenant = await tenantId(pool);
  const actorResult = await pool.query<{ id: string }>('SELECT id::text AS id FROM users WHERE email = $1', [
    actorEmail.trim().toLowerCase()
  ]);
  if (!actorResult.rows[0]?.id) {
    throw new Error(`Unable to resolve billing actor ${actorEmail}.`);
  }

  const current = await pool.query<{ status: string }>(
    'SELECT status FROM billing_invoices WHERE tenant_id = $1 AND id = $2',
    [tenant, invoiceId]
  );
  const currentStatus = current.rows[0]?.status;
  if (!currentStatus) {
    throw new Error('Billing invoice not found.');
  }
  if (currentStatus === 'paid') {
    throw new Error('Billing invoice is already paid.');
  }

  await pool.query(
    `
      UPDATE billing_invoices
      SET
        status = 'paid',
        amount_paid = amount_due,
        balance_due = 0,
        updated_at = NOW()
      WHERE tenant_id = $1 AND id = $2
    `,
    [tenant, invoiceId]
  );

  const invoices = await listBillingInvoices();
  const updated = invoices.find((invoice) => invoice.id === invoiceId);
  if (!updated) {
    throw new Error('Unable to reload paid invoice.');
  }
  return updated;
}
