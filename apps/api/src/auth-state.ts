import { randomUUID } from 'node:crypto';
import { pool } from '@mlm-hosting-saas/database';
import type { RoleKey, TenantContext } from '../../../packages/auth/src/model.js';
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from './auth-security.js';

type SessionRow = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  themePreset: string;
  tenantStatus: 'draft' | 'active';
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleKey;
};

type InvitationRow = {
  invitationId: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleKey;
  status: 'pending' | 'accepted' | 'revoked';
  expiresAt: string;
};

async function buildTenantContextFromQuery(sql: string, params: unknown[]) {
  const result = await pool.query<SessionRow>(
    sql,
    params
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    tenant: {
      id: row.tenantId,
      slug: row.tenantSlug,
      name: row.tenantName,
      themePreset: row.themePreset,
      status: row.tenantStatus
    },
    user: {
      id: row.userId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName
    },
    role: row.role
  } satisfies TenantContext;
}

export async function resolveTenantContextBySessionToken(sessionToken: string) {
  const sessionTokenHash = hashSessionToken(sessionToken);

  const tenantContext = await buildTenantContextFromQuery(
    `
      SELECT
        t.id::text AS "tenantId",
        t.slug AS "tenantSlug",
        t.name AS "tenantName",
        t.theme_preset AS "themePreset",
        t.status AS "tenantStatus",
        u.id::text AS "userId",
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        auth.role_key AS role
      FROM auth_sessions auth
      JOIN tenants t ON t.id = auth.tenant_id
      JOIN users u ON u.id = auth.user_id
      WHERE auth.session_token_hash = $1 AND auth.expires_at > NOW()
      LIMIT 1
    `,
    [sessionTokenHash]
  );

  if (tenantContext) {
    await pool.query(
      `
        UPDATE auth_sessions
        SET last_seen_at = NOW()
        WHERE session_token_hash = $1
      `,
      [sessionTokenHash]
    );
  }

  return tenantContext;
}

export async function resolveTenantContextByEmail(tenantSlug: string, userEmail: string) {
  return buildTenantContextFromQuery(
    `
      SELECT
        t.id::text AS "tenantId",
        t.slug AS "tenantSlug",
        t.name AS "tenantName",
        t.theme_preset AS "themePreset",
        t.status AS "tenantStatus",
        u.id::text AS "userId",
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        tu.role_key AS role
      FROM tenant_users tu
      JOIN tenants t ON t.id = tu.tenant_id
      JOIN users u ON u.id = tu.user_id
      WHERE t.slug = $1 AND u.email = $2
      LIMIT 1
    `,
    [tenantSlug, userEmail]
  );
}

export async function createAuthSession(input: {
  tenantId: string;
  userId: string;
  role: RoleKey;
}) {
  const sessionToken = createSessionToken();
  const sessionTokenHash = hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();

  await pool.query(
    `
      INSERT INTO auth_sessions (id, tenant_id, user_id, role_key, session_token_hash, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [randomUUID(), input.tenantId, input.userId, input.role, sessionTokenHash, expiresAt]
  );

  return {
    sessionToken,
    expiresAt
  };
}

export async function revokeAuthSession(sessionToken: string) {
  await pool.query('DELETE FROM auth_sessions WHERE session_token_hash = $1', [hashSessionToken(sessionToken)]);
}

export async function authenticateUser(input: {
  tenantSlug: string;
  email: string;
  password: string;
}) {
  const result = await pool.query<{
    tenantId: string;
    userId: string;
    passwordHash: string;
    role: RoleKey;
  }>(
    `
      SELECT
        t.id::text AS "tenantId",
        u.id::text AS "userId",
        u.password_hash AS "passwordHash",
        tu.role_key AS role
      FROM tenants t
      JOIN tenant_users tu ON tu.tenant_id = t.id
      JOIN users u ON u.id = tu.user_id
      WHERE t.slug = $1 AND u.email = $2
      LIMIT 1
    `,
    [input.tenantSlug.trim(), input.email.trim().toLowerCase()]
  );

  const row = result.rows[0];
  if (!row) return null;

  const passwordValid = await verifyPassword(input.password, row.passwordHash);
  if (!passwordValid) return null;

  return {
    tenantId: row.tenantId,
    userId: row.userId,
    role: row.role
  };
}

export async function acceptInvitation(input: {
  tenantSlug: string;
  invitationToken: string;
  password: string;
}) {
  const invitationResult = await pool.query<InvitationRow>(
    `
      SELECT
        invite.id::text AS "invitationId",
        t.id::text AS "tenantId",
        t.slug AS "tenantSlug",
        invite.email,
        invite.first_name AS "firstName",
        invite.last_name AS "lastName",
        invite.role_key AS role,
        invite.status,
        invite.expires_at::text AS "expiresAt"
      FROM tenant_invitations invite
      JOIN tenants t ON t.id = invite.tenant_id
      WHERE t.slug = $1 AND invite.invitation_token = $2
      LIMIT 1
    `,
    [input.tenantSlug.trim(), input.invitationToken.trim()]
  );

  const invitation = invitationResult.rows[0];
  if (!invitation) {
    throw new Error('Invitation not found.');
  }

  if (invitation.status !== 'pending') {
    throw new Error('Invitation is no longer pending.');
  }

  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    throw new Error('Invitation has expired.');
  }

  const passwordHash = await hashPassword(input.password);
  let userId: string | null = null;

  const existingUser = await pool.query<{ id: string }>('SELECT id::text AS id FROM users WHERE email = $1', [
    invitation.email
  ]);
  userId = existingUser.rows[0]?.id || null;

  if (userId) {
    await pool.query(
      `
        UPDATE users
        SET
          first_name = $2,
          last_name = $3,
          password_hash = $4,
          updated_at = NOW()
        WHERE id = $1
      `,
      [userId, invitation.firstName, invitation.lastName, passwordHash]
    );
  } else {
    userId = (
      await pool.query<{ id: string }>(
        `
          INSERT INTO users (id, email, password_hash, first_name, last_name)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id::text AS id
        `,
        [randomUUID(), invitation.email, passwordHash, invitation.firstName, invitation.lastName]
      )
    ).rows[0]?.id || null;
  }

  if (!userId) {
    throw new Error('Unable to provision the invited user.');
  }

  await pool.query(
    `
      INSERT INTO tenant_users (id, tenant_id, user_id, role_key)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (tenant_id, user_id, role_key) DO NOTHING
    `,
    [randomUUID(), invitation.tenantId, userId, invitation.role]
  );

  await pool.query(
    `
      UPDATE tenant_invitations
      SET
        status = 'accepted',
        accepted_at = NOW()
      WHERE id = $1
    `,
    [invitation.invitationId]
  );

  return {
    tenantId: invitation.tenantId,
    tenantSlug: invitation.tenantSlug,
    userId,
    email: invitation.email,
    role: invitation.role
  };
}

export async function requestPasswordReset(input: {
  tenantSlug: string;
  email: string;
}) {
  const result = await pool.query<{
    tenantId: string;
    userId: string;
    email: string;
  }>(
    `
      SELECT
        t.id::text AS "tenantId",
        u.id::text AS "userId",
        u.email
      FROM tenants t
      JOIN tenant_users tu ON tu.tenant_id = t.id
      JOIN users u ON u.id = tu.user_id
      WHERE t.slug = $1 AND u.email = $2
      LIMIT 1
    `,
    [input.tenantSlug.trim(), input.email.trim().toLowerCase()]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const resetToken = createSessionToken();
  const resetTokenHash = hashSessionToken(resetToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  await pool.query(
    `
      INSERT INTO password_reset_tokens (
        id,
        tenant_id,
        user_id,
        token_hash,
        status,
        expires_at
      )
      VALUES ($1, $2, $3, $4, 'pending', $5)
    `,
    [randomUUID(), row.tenantId, row.userId, resetTokenHash, expiresAt]
  );

  return {
    tenantId: row.tenantId,
    userId: row.userId,
    email: row.email,
    resetToken,
    expiresAt
  };
}

export async function resetPassword(input: {
  tenantSlug: string;
  resetToken: string;
  password: string;
}) {
  const resetTokenHash = hashSessionToken(input.resetToken.trim());
  const result = await pool.query<{
    tokenId: string;
    tenantId: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: RoleKey;
  }>(
    `
      SELECT
        token.id::text AS "tokenId",
        t.id::text AS "tenantId",
        u.id::text AS "userId",
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        tu.role_key AS role
      FROM password_reset_tokens token
      JOIN tenants t ON t.id = token.tenant_id
      JOIN users u ON u.id = token.user_id
      JOIN tenant_users tu ON tu.tenant_id = t.id AND tu.user_id = u.id
      WHERE
        t.slug = $1
        AND token.token_hash = $2
        AND token.status = 'pending'
        AND token.expires_at > NOW()
      LIMIT 1
    `,
    [input.tenantSlug.trim(), resetTokenHash]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Password reset token is invalid or expired.');
  }

  const passwordHash = await hashPassword(input.password);

  await pool.query(
    `
      UPDATE users
      SET
        password_hash = $2,
        updated_at = NOW()
      WHERE id = $1
    `,
    [row.userId, passwordHash]
  );

  await pool.query(
    `
      UPDATE password_reset_tokens
      SET
        status = 'used',
        used_at = NOW()
      WHERE id = $1
    `,
    [row.tokenId]
  );

  return {
    tenantId: row.tenantId,
    userId: row.userId,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role
  };
}
