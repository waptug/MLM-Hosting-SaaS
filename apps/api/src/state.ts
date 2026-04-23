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

export function addTenantUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  role: RoleKey;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingUser = demoUsers.find((user) => user.email === normalizedEmail);

  if (!existingUser) {
    demoUsers.push({
      id: `user_${demoUsers.length + 1}`,
      email: normalizedEmail,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim()
    });
  }

  const existingMembership = demoMemberships.find(
    (membership) =>
      membership.tenantSlug === demoTenant.slug && membership.userEmail === normalizedEmail
  );

  if (existingMembership) {
    existingMembership.role = input.role;
  } else {
    demoMemberships.push({
      tenantSlug: demoTenant.slug,
      userEmail: normalizedEmail,
      role: input.role
    });
  }

  return listTenantUsers().find((user) => user.email === normalizedEmail)!;
}
