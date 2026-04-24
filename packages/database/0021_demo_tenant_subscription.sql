INSERT INTO tenant_subscriptions (
  id,
  tenant_id,
  plan_key,
  plan_name,
  billing_interval,
  status,
  seat_limit,
  price_per_period,
  currency,
  current_period_start,
  current_period_end,
  trial_ends_at,
  cancel_at_period_end
)
VALUES (
  '00000000-0000-0000-0000-000000000801',
  '00000000-0000-0000-0000-000000000001',
  'growth',
  'Growth Partner',
  'monthly',
  'active',
  25,
  149.00,
  'USD',
  DATE '2026-04-01',
  DATE '2026-04-30',
  NULL,
  FALSE
)
ON CONFLICT (tenant_id) DO UPDATE
SET
  plan_key = EXCLUDED.plan_key,
  plan_name = EXCLUDED.plan_name,
  billing_interval = EXCLUDED.billing_interval,
  status = EXCLUDED.status,
  seat_limit = EXCLUDED.seat_limit,
  price_per_period = EXCLUDED.price_per_period,
  currency = EXCLUDED.currency,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  trial_ends_at = EXCLUDED.trial_ends_at,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at = NOW();

INSERT INTO billing_invoices (
  id,
  tenant_id,
  subscription_id,
  invoice_number,
  period_label,
  issued_at,
  due_at,
  status,
  amount_due,
  amount_paid,
  balance_due,
  notes
)
VALUES
  (
    '00000000-0000-0000-0000-000000000811',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000801',
    'INV-2026-004',
    'April 2026',
    DATE '2026-04-01',
    DATE '2026-04-15',
    'open',
    149.00,
    0,
    149.00,
    'Current month subscription invoice.'
  ),
  (
    '00000000-0000-0000-0000-000000000812',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000801',
    'INV-2026-003',
    'March 2026',
    DATE '2026-03-01',
    DATE '2026-03-15',
    'paid',
    149.00,
    149.00,
    0,
    'Historical paid invoice.'
  )
ON CONFLICT (tenant_id, invoice_number) DO UPDATE
SET
  period_label = EXCLUDED.period_label,
  issued_at = EXCLUDED.issued_at,
  due_at = EXCLUDED.due_at,
  status = EXCLUDED.status,
  amount_due = EXCLUDED.amount_due,
  amount_paid = EXCLUDED.amount_paid,
  balance_due = EXCLUDED.balance_due,
  notes = EXCLUDED.notes,
  updated_at = NOW();
