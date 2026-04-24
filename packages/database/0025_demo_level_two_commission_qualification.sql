UPDATE commission_rules
SET
  rank_floor = 'active-orders>=2'
WHERE plan_version_id = '00000000-0000-0000-0000-000000000701'
  AND rule_key = 'level-2-override';
