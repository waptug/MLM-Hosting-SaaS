INSERT INTO tenants (id, slug, name, status, theme_preset)
VALUES (
  'tenant_demo_hosting_group',
  'demo-hosting-group',
  'Demo Hosting Group',
  'draft',
  'forest'
)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  theme_preset = EXCLUDED.theme_preset,
  updated_at = NOW();

INSERT INTO users (id, email, password_hash, first_name, last_name)
VALUES
  ('user_owner_01', 'owner@example.com', 'demo-password-hash', 'Morgan', 'Blake'),
  ('user_manager_01', 'manager@example.com', 'demo-password-hash', 'Jamie', 'Cole'),
  ('user_rep_01', 'rep@example.com', 'demo-password-hash', 'Taylor', 'Reese')
ON CONFLICT (email) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

INSERT INTO tenant_users (id, tenant_id, user_id, role_key)
VALUES
  ('tu_owner_01', 'tenant_demo_hosting_group', 'user_owner_01', 'tenant_owner'),
  ('tu_manager_01', 'tenant_demo_hosting_group', 'user_manager_01', 'tenant_manager'),
  ('tu_rep_01', 'tenant_demo_hosting_group', 'user_rep_01', 'sales_rep')
ON CONFLICT (tenant_id, user_id, role_key) DO NOTHING;

INSERT INTO sales_groups (id, tenant_id, name, code, region, manager_user_id, status, notes)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  'tenant_demo_hosting_group',
  'Core Hosting Team',
  'CORE',
  'North America',
  'user_manager_01',
  'active',
  'Initial launch team for reseller recruiting and hosting plan sales.'
)
ON CONFLICT (tenant_id, code) DO UPDATE
SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  manager_user_id = EXCLUDED.manager_user_id,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO members (id, tenant_id, sales_group_id, sponsor_member_id, first_name, last_name, email, role_title, status)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'tenant_demo_hosting_group',
    '00000000-0000-0000-0000-000000000101',
    NULL,
    'Jordan',
    'Blake',
    'jordan.blake@example.com',
    'Group Lead',
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'tenant_demo_hosting_group',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    'Taylor',
    'Reese',
    'taylor.reese@example.com',
    'Senior Rep',
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
  id, tenant_id, owner_member_id, company_name, contact_name, email, phone, status, monthly_revenue, source, notes
)
VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    'tenant_demo_hosting_group',
    '00000000-0000-0000-0000-000000000201',
    'North Ridge Fitness',
    'Casey Warren',
    'casey@nrfitness.example',
    '555-0101',
    'active',
    249,
    'Referral',
    'Primary hosting plan with monthly reporting add-on.'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'tenant_demo_hosting_group',
    '00000000-0000-0000-0000-000000000202',
    'Blue Harbor Repairs',
    'Morgan Lee',
    'morgan@blueharbor.example',
    '555-0147',
    'lead',
    129,
    'Outbound call',
    'Interested in migrating from shared hosting.'
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

INSERT INTO products (id, tenant_id, name, sku, billing_cycle, unit_price, commissionable_rate, status)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    'tenant_demo_hosting_group',
    'Reseller Starter Hosting',
    'HOST-START',
    'monthly',
    49,
    0.20,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    'tenant_demo_hosting_group',
    'Managed Email Bundle',
    'EMAIL-MANAGED',
    'monthly',
    19,
    0.15,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    'tenant_demo_hosting_group',
    'Annual VPS Hosting',
    'VPS-ANNUAL',
    'annual',
    899,
    0.25,
    'active'
  )
ON CONFLICT (tenant_id, sku) DO UPDATE
SET
  name = EXCLUDED.name,
  billing_cycle = EXCLUDED.billing_cycle,
  unit_price = EXCLUDED.unit_price,
  commissionable_rate = EXCLUDED.commissionable_rate,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO orders (
  id, tenant_id, customer_id, product_id, selling_member_id, quantity, unit_price, billing_cycle, status, placed_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000501',
    'tenant_demo_hosting_group',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000201',
    1,
    49,
    'monthly',
    'active',
    DATE '2026-04-12'
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    'tenant_demo_hosting_group',
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000202',
    2,
    19,
    'monthly',
    'pending',
    DATE '2026-04-18'
  )
ON CONFLICT (id) DO NOTHING;
