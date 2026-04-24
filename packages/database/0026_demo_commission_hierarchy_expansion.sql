UPDATE commission_rules
SET
  rank_floor = 'active-orders>=1,role=Group Lead,group=CORE'
WHERE plan_version_id = '00000000-0000-0000-0000-000000000701'
  AND rule_key IN ('level-1-override', 'level-2-override');

UPDATE orders
SET status = 'active'
WHERE id = '00000000-0000-0000-0000-000000000502';

INSERT INTO members (
  id,
  tenant_id,
  sales_group_id,
  sponsor_member_id,
  first_name,
  last_name,
  email,
  role_title,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000202',
  'Avery',
  'Stone',
  'avery.stone@example.com',
  'Rep',
  'active'
)
ON CONFLICT (tenant_id, email) DO UPDATE
SET
  sales_group_id = EXCLUDED.sales_group_id,
  sponsor_member_id = EXCLUDED.sponsor_member_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_title = EXCLUDED.role_title,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO customers (
  id,
  tenant_id,
  owner_member_id,
  company_name,
  contact_name,
  email,
  phone,
  status,
  monthly_revenue,
  source,
  notes
)
VALUES (
  '00000000-0000-0000-0000-000000000303',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000203',
  'Summit Atlas Labs',
  'Riley Chen',
  'riley@summitatlas.example',
  '555-0198',
  'active',
  179,
  'Referral',
  'Expanded demo account to exercise second-level commission rules.'
)
ON CONFLICT (tenant_id, email) DO UPDATE
SET
  owner_member_id = EXCLUDED.owner_member_id,
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  monthly_revenue = EXCLUDED.monthly_revenue,
  source = EXCLUDED.source,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO orders (
  id,
  tenant_id,
  customer_id,
  product_id,
  selling_member_id,
  quantity,
  unit_price,
  billing_cycle,
  status,
  placed_at
)
VALUES (
  '00000000-0000-0000-0000-000000000503',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000303',
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000203',
  1,
  49,
  'monthly',
  'active',
  DATE '2026-04-20'
)
ON CONFLICT (id) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  product_id = EXCLUDED.product_id,
  selling_member_id = EXCLUDED.selling_member_id,
  quantity = EXCLUDED.quantity,
  unit_price = EXCLUDED.unit_price,
  billing_cycle = EXCLUDED.billing_cycle,
  status = EXCLUDED.status,
  placed_at = EXCLUDED.placed_at;
