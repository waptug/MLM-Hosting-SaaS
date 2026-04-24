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
VALUES (
  '00000000-0000-0000-0000-000000000714',
  '00000000-0000-0000-0000-000000000701',
  'level-2-override',
  'Level 2 Sponsor Override',
  'override',
  2,
  0.0200,
  0,
  '',
  'Applies to second-level sponsor commission on active orders.'
)
ON CONFLICT (plan_version_id, rule_key) DO UPDATE
SET
  rule_label = EXCLUDED.rule_label,
  rule_type = EXCLUDED.rule_type,
  level_number = EXCLUDED.level_number,
  percent_rate = EXCLUDED.percent_rate,
  fixed_amount = EXCLUDED.fixed_amount,
  rank_floor = EXCLUDED.rank_floor,
  notes = EXCLUDED.notes;
