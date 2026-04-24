CREATE TABLE commission_plan_versions (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, plan_name, version_number)
);

CREATE INDEX commission_plan_versions_tenant_status_idx
  ON commission_plan_versions (tenant_id, status, created_at DESC);

CREATE TABLE commission_rules (
  id UUID PRIMARY KEY,
  plan_version_id UUID NOT NULL REFERENCES commission_plan_versions(id) ON DELETE CASCADE,
  rule_key TEXT NOT NULL,
  rule_label TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  level_number INTEGER NOT NULL DEFAULT 0,
  percent_rate NUMERIC(8, 4) NOT NULL DEFAULT 0,
  fixed_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  rank_floor TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX commission_rules_plan_idx
  ON commission_rules (plan_version_id, rule_type, level_number);
