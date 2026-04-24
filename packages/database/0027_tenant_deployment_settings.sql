CREATE TABLE tenant_deployment_settings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  database_host TEXT NOT NULL DEFAULT '',
  database_port INTEGER NOT NULL DEFAULT 5432,
  database_name TEXT NOT NULL DEFAULT '',
  database_user TEXT NOT NULL DEFAULT '',
  database_path TEXT NOT NULL DEFAULT '',
  app_root_path TEXT NOT NULL DEFAULT '',
  backup_path TEXT NOT NULL DEFAULT '',
  logs_path TEXT NOT NULL DEFAULT '',
  public_url TEXT NOT NULL DEFAULT '',
  api_url TEXT NOT NULL DEFAULT '',
  trusted_origins TEXT NOT NULL DEFAULT '',
  session_cookie_domain TEXT NOT NULL DEFAULT '',
  backup_retention_days INTEGER NOT NULL DEFAULT 7,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

CREATE INDEX tenant_deployment_settings_tenant_idx
  ON tenant_deployment_settings (tenant_id, updated_at DESC);
