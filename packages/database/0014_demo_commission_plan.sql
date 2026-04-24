INSERT INTO commission_plan_versions (
  id,
  tenant_id,
  plan_name,
  version_number,
  status,
  effective_from,
  notes
)
VALUES (
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000001',
  'Default Hosting Commission Plan',
  1,
  'active',
  DATE '2026-04-01',
  'Seeded plan for the demo tenant.'
)
ON CONFLICT (tenant_id, plan_name, version_number) DO UPDATE
SET
  status = EXCLUDED.status,
  effective_from = EXCLUDED.effective_from,
  notes = EXCLUDED.notes,
  updated_at = NOW();

DELETE FROM commission_rules
WHERE plan_version_id = '00000000-0000-0000-0000-000000000701';

INSERT INTO commission_rules (
  id,
  plan_version_id,
  rule_key,
  rule_label,
  rule_type,
  level_number,
  percent_rate,
  fixed_amount,
  rank_floor,
  notes
)
VALUES
  (
    '00000000-0000-0000-0000-000000000711',
    '00000000-0000-0000-0000-000000000701',
    'direct-retail',
    'Direct Retail Commission',
    'direct',
    0,
    0.2000,
    0,
    '',
    'Product commissionable rate is still stored on the product catalog.'
  ),
  (
    '00000000-0000-0000-0000-000000000712',
    '00000000-0000-0000-0000-000000000701',
    'level-1-override',
    'Level 1 Sponsor Override',
    'override',
    1,
    0.0500,
    0,
    '',
    'Applies to direct sponsor commission on active orders.'
  ),
  (
    '00000000-0000-0000-0000-000000000713',
    '00000000-0000-0000-0000-000000000701',
    'payout-approval',
    'Finance Approval Rule',
    'workflow',
    0,
    0,
    0,
    '',
    'Draft batches may move to approved, then to paid.'
  )
;
