CREATE TABLE payout_batches (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL,
  scheduled_for DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  payee_count INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  approved_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  paid_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, period_label)
);

CREATE INDEX payout_batches_tenant_schedule_idx ON payout_batches (tenant_id, scheduled_for DESC);
