export const platformRoles = ['platform_admin', 'support_admin'] as const;
export const tenantRoles = [
  'tenant_owner',
  'tenant_manager',
  'recruiter',
  'sales_rep',
  'finance_manager'
] as const;

export const allRoles = [...platformRoles, ...tenantRoles] as const;

export type PlatformRole = (typeof platformRoles)[number];
export type TenantRole = (typeof tenantRoles)[number];
export type RoleKey = (typeof allRoles)[number];

export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type TenantContext = {
  tenant: {
    id: string;
    slug: string;
    name: string;
    themePreset: string;
    status: 'draft' | 'active';
  };
  user: AuthenticatedUser;
  role: RoleKey;
};

export function isRoleKey(value: string): value is RoleKey {
  return allRoles.includes(value as RoleKey);
}

