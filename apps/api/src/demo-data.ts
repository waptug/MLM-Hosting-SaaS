import type { AuthenticatedUser, RoleKey } from '../../../packages/auth/src/model.js';

export const demoTenant = {
  id: 'tenant_demo_hosting_group',
  slug: 'demo-hosting-group',
  name: 'Demo Hosting Group',
  themePreset: 'forest',
  status: 'draft' as const
};

export const demoUsers: AuthenticatedUser[] = [
  {
    id: 'user_owner_01',
    email: 'owner@example.com',
    firstName: 'Morgan',
    lastName: 'Blake'
  },
  {
    id: 'user_manager_01',
    email: 'manager@example.com',
    firstName: 'Jamie',
    lastName: 'Cole'
  },
  {
    id: 'user_rep_01',
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
