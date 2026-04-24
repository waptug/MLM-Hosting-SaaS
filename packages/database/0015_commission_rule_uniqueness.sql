ALTER TABLE commission_rules
  ADD CONSTRAINT commission_rules_plan_rule_key_uniq UNIQUE (plan_version_id, rule_key);
