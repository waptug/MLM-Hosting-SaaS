UPDATE tenants
SET
  owner_user_id = '00000000-0000-0000-0000-000000000011',
  support_email = 'support@demo-hosting-group.example',
  brand_label = 'Demo Hosting Group',
  primary_domain = 'demo-hosting-group.example',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';
