import type { RoleKey } from '../../../packages/auth/src/model.js';

export type PermissionKey =
  | 'manage_users'
  | 'send_invitations'
  | 'manage_sales_groups'
  | 'manage_members'
  | 'manage_customers'
  | 'manage_orders'
  | 'review_commissions'
  | 'approve_payouts'
  | 'manage_billing'
  | 'view_audit';

export type RolePermissionRow = {
  role: RoleKey;
  label: string;
  permissions: Record<PermissionKey, boolean>;
};

export const permissionKeys: Array<{ key: PermissionKey; label: string }> = [
  { key: 'manage_users', label: 'Users' },
  { key: 'send_invitations', label: 'Invitations' },
  { key: 'manage_sales_groups', label: 'Sales groups' },
  { key: 'manage_members', label: 'Members' },
  { key: 'manage_customers', label: 'Customers' },
  { key: 'manage_orders', label: 'Orders' },
  { key: 'review_commissions', label: 'Commissions' },
  { key: 'approve_payouts', label: 'Payouts' },
  { key: 'manage_billing', label: 'Billing' },
  { key: 'view_audit', label: 'Audit' }
];

export const rolePermissionMatrix: RolePermissionRow[] = [
  {
    role: 'tenant_owner',
    label: 'Tenant owner',
    permissions: {
      manage_users: true,
      send_invitations: true,
      manage_sales_groups: true,
      manage_members: true,
      manage_customers: true,
      manage_orders: true,
      review_commissions: true,
      approve_payouts: true,
      manage_billing: true,
      view_audit: true
    }
  },
  {
    role: 'tenant_manager',
    label: 'Tenant manager',
    permissions: {
      manage_users: true,
      send_invitations: true,
      manage_sales_groups: true,
      manage_members: true,
      manage_customers: true,
      manage_orders: true,
      review_commissions: true,
      approve_payouts: false,
      manage_billing: false,
      view_audit: true
    }
  },
  {
    role: 'recruiter',
    label: 'Recruiter',
    permissions: {
      manage_users: false,
      send_invitations: true,
      manage_sales_groups: false,
      manage_members: true,
      manage_customers: true,
      manage_orders: false,
      review_commissions: false,
      approve_payouts: false,
      manage_billing: false,
      view_audit: false
    }
  },
  {
    role: 'sales_rep',
    label: 'Sales rep',
    permissions: {
      manage_users: false,
      send_invitations: false,
      manage_sales_groups: false,
      manage_members: false,
      manage_customers: true,
      manage_orders: true,
      review_commissions: false,
      approve_payouts: false,
      manage_billing: false,
      view_audit: false
    }
  },
  {
    role: 'finance_manager',
    label: 'Finance manager',
    permissions: {
      manage_users: false,
      send_invitations: false,
      manage_sales_groups: false,
      manage_members: false,
      manage_customers: false,
      manage_orders: false,
      review_commissions: true,
      approve_payouts: true,
      manage_billing: true,
      view_audit: true
    }
  }
];

export function buildPermissionMatrix() {
  return rolePermissionMatrix.map((row) => ({
    role: row.role,
    label: row.label,
    permissions: permissionKeys.map((permission) => ({
      key: permission.key,
      label: permission.label,
      allowed: row.permissions[permission.key]
    }))
  }));
}
