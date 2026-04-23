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

export type Member = {
  id: string;
  tenantSlug: string;
  salesGroupId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  status: 'prospect' | 'active' | 'paused';
  sponsorMemberId: string | null;
};

export type Customer = {
  id: string;
  tenantSlug: string;
  ownerMemberId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'lead' | 'active' | 'past_due' | 'churned';
  monthlyRevenue: number;
  source: string;
  notes: string;
};

export type Product = {
  id: string;
  tenantSlug: string;
  name: string;
  sku: string;
  billingCycle: 'monthly' | 'annual';
  unitPrice: number;
  commissionableRate: number;
  status: 'active' | 'retired';
};

export type Order = {
  id: string;
  tenantSlug: string;
  customerId: string;
  productId: string;
  sellingMemberId: string;
  quantity: number;
  unitPrice: number;
  billingCycle: 'monthly' | 'annual';
  status: 'pending' | 'active' | 'cancelled';
  placedAt: string;
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

const members: Member[] = [
  {
    id: 'member_1',
    tenantSlug: demoTenant.slug,
    salesGroupId: 'group_1',
    firstName: 'Jordan',
    lastName: 'Blake',
    email: 'jordan.blake@example.com',
    roleTitle: 'Group Lead',
    status: 'active',
    sponsorMemberId: null
  },
  {
    id: 'member_2',
    tenantSlug: demoTenant.slug,
    salesGroupId: 'group_1',
    firstName: 'Taylor',
    lastName: 'Reese',
    email: 'taylor.reese@example.com',
    roleTitle: 'Senior Rep',
    status: 'active',
    sponsorMemberId: 'member_1'
  }
];

const customers: Customer[] = [
  {
    id: 'customer_1',
    tenantSlug: demoTenant.slug,
    ownerMemberId: 'member_1',
    companyName: 'North Ridge Fitness',
    contactName: 'Casey Warren',
    email: 'casey@nrfitness.example',
    phone: '555-0101',
    status: 'active',
    monthlyRevenue: 249,
    source: 'Referral',
    notes: 'Primary hosting plan with monthly reporting add-on.'
  },
  {
    id: 'customer_2',
    tenantSlug: demoTenant.slug,
    ownerMemberId: 'member_2',
    companyName: 'Blue Harbor Repairs',
    contactName: 'Morgan Lee',
    email: 'morgan@blueharbor.example',
    phone: '555-0147',
    status: 'lead',
    monthlyRevenue: 129,
    source: 'Outbound call',
    notes: 'Interested in migrating from shared hosting.'
  }
];

const products: Product[] = [
  {
    id: 'product_1',
    tenantSlug: demoTenant.slug,
    name: 'Reseller Starter Hosting',
    sku: 'HOST-START',
    billingCycle: 'monthly',
    unitPrice: 49,
    commissionableRate: 0.2,
    status: 'active'
  },
  {
    id: 'product_2',
    tenantSlug: demoTenant.slug,
    name: 'Managed Email Bundle',
    sku: 'EMAIL-MANAGED',
    billingCycle: 'monthly',
    unitPrice: 19,
    commissionableRate: 0.15,
    status: 'active'
  },
  {
    id: 'product_3',
    tenantSlug: demoTenant.slug,
    name: 'Annual VPS Hosting',
    sku: 'VPS-ANNUAL',
    billingCycle: 'annual',
    unitPrice: 899,
    commissionableRate: 0.25,
    status: 'active'
  }
];

const orders: Order[] = [
  {
    id: 'order_1',
    tenantSlug: demoTenant.slug,
    customerId: 'customer_1',
    productId: 'product_1',
    sellingMemberId: 'member_1',
    quantity: 1,
    unitPrice: 49,
    billingCycle: 'monthly',
    status: 'active',
    placedAt: '2026-04-12'
  },
  {
    id: 'order_2',
    tenantSlug: demoTenant.slug,
    customerId: 'customer_2',
    productId: 'product_2',
    sellingMemberId: 'member_2',
    quantity: 2,
    unitPrice: 19,
    billingCycle: 'monthly',
    status: 'pending',
    placedAt: '2026-04-18'
  }
];

function memberDisplayName(memberId: string | null) {
  if (!memberId) return '';
  const member = members.find(
    (candidate) => candidate.tenantSlug === demoTenant.slug && candidate.id === memberId
  );
  return member ? `${member.firstName} ${member.lastName}` : '';
}

export function hasMember(memberId: string) {
  return members.some(
    (candidate) => candidate.tenantSlug === demoTenant.slug && candidate.id === memberId
  );
}

export function hasCustomer(customerId: string) {
  return customers.some(
    (candidate) => candidate.tenantSlug === demoTenant.slug && candidate.id === customerId
  );
}

export function hasProduct(productId: string) {
  return products.some(
    (candidate) => candidate.tenantSlug === demoTenant.slug && candidate.id === productId
  );
}

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

export function listMembers() {
  return members
    .filter((member) => member.tenantSlug === demoTenant.slug)
    .map((member) => ({
      ...member,
      salesGroupName: salesGroups.find((group) => group.id === member.salesGroupId)?.name || '',
      sponsorName: memberDisplayName(member.sponsorMemberId)
    }))
    .sort((left, right) => left.lastName.localeCompare(right.lastName));
}

export function addMember(input: Omit<Member, 'id' | 'tenantSlug'>) {
  const member: Member = {
    id: `member_${members.length + 1}`,
    tenantSlug: demoTenant.slug,
    ...input
  };
  members.push(member);
  return listMembers().find((entry) => entry.id === member.id)!;
}

export function listCustomers() {
  return customers
    .filter((customer) => customer.tenantSlug === demoTenant.slug)
    .map((customer) => ({
      ...customer,
      ownerMemberName: memberDisplayName(customer.ownerMemberId)
    }))
    .sort((left, right) => left.companyName.localeCompare(right.companyName));
}

export function addCustomer(input: Omit<Customer, 'id' | 'tenantSlug'>) {
  const customer: Customer = {
    id: `customer_${customers.length + 1}`,
    tenantSlug: demoTenant.slug,
    ...input
  };
  customers.push(customer);
  return listCustomers().find((entry) => entry.id === customer.id)!;
}

export function listProducts() {
  return products
    .filter((product) => product.tenantSlug === demoTenant.slug)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function listOrders() {
  return orders
    .filter((order) => order.tenantSlug === demoTenant.slug)
    .map((order) => ({
      ...order,
      customerName: customers.find((customer) => customer.id === order.customerId)?.companyName || '',
      productName: products.find((product) => product.id === order.productId)?.name || '',
      memberName: memberDisplayName(order.sellingMemberId),
      totalAmount: order.quantity * order.unitPrice
    }))
    .sort((left, right) => right.placedAt.localeCompare(left.placedAt));
}

export function addOrder(input: Omit<Order, 'id' | 'tenantSlug'>) {
  const order: Order = {
    id: `order_${orders.length + 1}`,
    tenantSlug: demoTenant.slug,
    ...input
  };
  orders.push(order);
  return listOrders().find((entry) => entry.id === order.id)!;
}
