import type { RoleKey } from '../../../packages/auth/src/model.js';
import type { AuthenticatedUser } from '../../../packages/auth/src/model.js';
import { demoMemberships, demoTenant, demoUsers } from './demo-data.js';

export type TenantSetup = {
  slug: string;
  name: string;
  themePreset: string;
  status: 'draft' | 'active';
  ownerEmail: string;
  supportEmail: string;
  brandLabel: string;
  primaryDomain: string;
};

const tenantSetup: TenantSetup = {
  slug: demoTenant.slug,
  name: demoTenant.name,
  themePreset: demoTenant.themePreset,
  status: demoTenant.status,
  ownerEmail: 'owner@example.com',
  supportEmail: 'support@demo-hosting-group.example',
  brandLabel: 'Demo Hosting Group',
  primaryDomain: 'demo-hosting-group.example'
};

export function getTenantSetup() {
  return tenantSetup;
}

export function updateTenantSetup(input: Partial<TenantSetup>) {
  Object.assign(tenantSetup, input);
  demoTenant.slug = tenantSetup.slug;
  demoTenant.name = tenantSetup.name;
  demoTenant.themePreset = tenantSetup.themePreset;
  demoTenant.status = tenantSetup.status;
  return tenantSetup;
}

export function listTenantUsers(): Array<AuthenticatedUser & { role: RoleKey }> {
  return demoMemberships
    .filter((membership) => membership.tenantSlug === demoTenant.slug)
    .map((membership) => {
      const user = demoUsers.find((entry) => entry.email === membership.userEmail);
      return {
        ...(user as AuthenticatedUser),
        role: membership.role
      };
    });
}
