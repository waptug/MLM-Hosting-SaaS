INSERT INTO payout_batches (
  id,
  tenant_id,
  period_label,
  scheduled_for,
  status,
  payee_count,
  total_amount,
  paid_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000001',
    'April 2026',
    DATE '2026-04-30',
    'draft',
    1,
    9.80,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000001',
    'March 2026',
    DATE '2026-03-31',
    'paid',
    2,
    112.50,
    TIMESTAMPTZ '2026-03-31T18:00:00Z'
  )
ON CONFLICT (tenant_id, period_label) DO UPDATE
SET
  scheduled_for = EXCLUDED.scheduled_for,
  status = EXCLUDED.status,
  payee_count = EXCLUDED.payee_count,
  total_amount = EXCLUDED.total_amount,
  paid_at = EXCLUDED.paid_at,
  updated_at = NOW();
