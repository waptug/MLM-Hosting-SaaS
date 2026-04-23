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

export type SalesGroup = {
  id: string;
  tenantSlug: string;
  name: string;
  code: string;
  region: string;
  managerEmail: string;
  status: 'draft' | 'active';
  notes: string;
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

const salesGroups: SalesGroup[] = [
  {
    id: 'group_1',
    tenantSlug: demoTenant.slug,
    name: 'Core Hosting Team',
    code: 'CORE',
    region: 'North America',
    managerEmail: 'manager@example.com',
    status: 'active',
    notes: 'Initial launch team for reseller recruiting and hosting plan sales.'
  }
];

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

export function listSalesGroups() {
  return salesGroups
    .filter((group) => group.tenantSlug === demoTenant.slug)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function addSalesGroup(input: Omit<SalesGroup, 'id' | 'tenantSlug'>) {
  const salesGroup: SalesGroup = {
    id: `group_${salesGroups.length + 1}`,
    tenantSlug: demoTenant.slug,
    ...input
  };
  salesGroups.push(salesGroup);
  return salesGroup;
}
