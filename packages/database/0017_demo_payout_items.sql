INSERT INTO payout_items (
  id,
  tenant_id,
  batch_id,
  payee_member_id,
  line_label,
  source_summary,
  direct_commission,
  override_commission,
  total_amount,
  order_count,
  notes
)
VALUES
  (
    '00000000-0000-0000-0000-000000000611',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000201',
    'Jordan Blake April 2026 Commission',
    'Active hosting orders credited to Jordan Blake.',
    7.84,
    1.96,
    9.80,
    1,
    'Seeded commission line for the demo batch.'
  ),
  (
    '00000000-0000-0000-0000-000000000612',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000201',
    'Jordan Blake March 2026 Commission',
    'Direct sales and sponsor overrides for March.',
    65.00,
    15.00,
    80.00,
    2,
    'Historical demo payout line.'
  ),
  (
    '00000000-0000-0000-0000-000000000613',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000202',
    'Taylor Reese March 2026 Commission',
    'Direct sales and sponsor overrides for March.',
    24.50,
    8.00,
    32.50,
    1,
    'Historical demo payout line.'
  )
ON CONFLICT (batch_id, payee_member_id) DO UPDATE
SET
  line_label = EXCLUDED.line_label,
  source_summary = EXCLUDED.source_summary,
  direct_commission = EXCLUDED.direct_commission,
  override_commission = EXCLUDED.override_commission,
  total_amount = EXCLUDED.total_amount,
  order_count = EXCLUDED.order_count,
  notes = EXCLUDED.notes,
  updated_at = NOW();
