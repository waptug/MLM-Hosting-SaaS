import type { AuthenticatedUser, RoleKey } from '../../../packages/auth/src/model.js';

export const demoTenant: {
  id: string;
  slug: string;
  name: string;
  themePreset: string;
  status: 'draft' | 'active';
} = {
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'demo-hosting-group',
  name: 'Demo Hosting Group',
  themePreset: 'forest',
  status: 'draft'
};

export const demoUsers: AuthenticatedUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000011',
    email: 'owner@example.com',
    firstName: 'Morgan',
    lastName: 'Blake'
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    email: 'manager@example.com',
    firstName: 'Jamie',
    lastName: 'Cole'
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    email: 'rep@example.com',
    firstName: 'Taylor',
    lastName: 'Reese'
  }
];

export const demoMemberships: Array<{
  tenantSlug: string;
  userEmail: string;
  role: RoleKey;
}> = [
  { tenantSlug: demoTenant.slug, userEmail: 'owner@example.com', role: 'tenant_owner' },
  { tenantSlug: demoTenant.slug, userEmail: 'manager@example.com', role: 'tenant_manager' },
  { tenantSlug: demoTenant.slug, userEmail: 'rep@example.com', role: 'sales_rep' }
];
