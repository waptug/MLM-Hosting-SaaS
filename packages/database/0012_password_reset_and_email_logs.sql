CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX password_reset_tokens_tenant_user_idx
  ON password_reset_tokens (tenant_id, user_id, created_at DESC);

CREATE TABLE email_delivery_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  token_preview TEXT NOT NULL DEFAULT '',
  related_entity_type TEXT NOT NULL DEFAULT '',
  related_entity_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX email_delivery_logs_tenant_created_idx
  ON email_delivery_logs (tenant_id, created_at DESC);
