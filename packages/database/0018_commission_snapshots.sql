CREATE TABLE commission_snapshots (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  sponsor_name TEXT NOT NULL DEFAULT '',
  active_orders INTEGER NOT NULL DEFAULT 0,
  direct_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  direct_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  override_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  source_label TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (batch_id, member_id)
);

CREATE INDEX commission_snapshots_tenant_batch_idx
  ON commission_snapshots (tenant_id, batch_id, total_commission DESC);
