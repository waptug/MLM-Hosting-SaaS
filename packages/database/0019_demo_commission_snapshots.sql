INSERT INTO commission_snapshots (
  id,
  tenant_id,
  batch_id,
  member_id,
  member_name,
  sponsor_name,
  active_orders,
  direct_revenue,
  direct_commission,
  override_commission,
  total_commission,
  source_label,
  notes
)
VALUES
  (
    '00000000-0000-0000-0000-000000000621',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000201',
    'Jordan Blake',
    '',
    1,
    49,
    7.84,
    1.96,
    9.80,
    'April 2026 payout snapshot',
    'Snapshot locked to the active demo rule set.'
  ),
  (
    '00000000-0000-0000-0000-000000000622',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000201',
    'Jordan Blake',
    '',
    2,
    149,
    65.00,
    15.00,
    80.00,
    'March 2026 payout snapshot',
    'Historical batch preserved after rule edits.'
  ),
  (
    '00000000-0000-0000-0000-000000000623',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000202',
    'Taylor Reese',
    'Jordan Blake',
    1,
    38,
    24.50,
    8.00,
    32.50,
    'March 2026 payout snapshot',
    'Sponsor override captured at the time of payout.'
  )
ON CONFLICT (batch_id, member_id) DO UPDATE
SET
  member_name = EXCLUDED.member_name,
  sponsor_name = EXCLUDED.sponsor_name,
  active_orders = EXCLUDED.active_orders,
  direct_revenue = EXCLUDED.direct_revenue,
  direct_commission = EXCLUDED.direct_commission,
  override_commission = EXCLUDED.override_commission,
  total_commission = EXCLUDED.total_commission,
  source_label = EXCLUDED.source_label,
  notes = EXCLUDED.notes;
