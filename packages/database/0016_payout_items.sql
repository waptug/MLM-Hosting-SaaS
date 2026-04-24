CREATE TABLE payout_items (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  payee_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  line_label TEXT NOT NULL,
  source_summary TEXT NOT NULL DEFAULT '',
  direct_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  override_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (batch_id, payee_member_id)
);

CREATE INDEX payout_items_tenant_batch_idx ON payout_items (tenant_id, batch_id, total_amount DESC);
