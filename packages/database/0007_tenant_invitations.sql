CREATE TABLE tenant_invitations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  role_key TEXT NOT NULL,
  invitation_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX tenant_invitations_pending_email_idx
  ON tenant_invitations (tenant_id, email)
  WHERE status = 'pending';

CREATE INDEX tenant_invitations_tenant_created_idx ON tenant_invitations (tenant_id, created_at DESC);
