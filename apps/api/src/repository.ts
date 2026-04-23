import { demoTenant } from './demo-data.js';
import type {
  CommissionSummary,
  Customer,
  Member,
  Order,
  PayoutBatch,
  Product,
  SalesGroup
} from './state.js';

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

export function listCommissionSummary() {
  const tenantMembers = members.filter((member) => member.tenantSlug === demoTenant.slug);
  const tenantProducts = products.filter((product) => product.tenantSlug === demoTenant.slug);
  const activeOrders = orders.filter(
    (order) => order.tenantSlug === demoTenant.slug && order.status === 'active'
  );

  const summaries = tenantMembers.map((member) => {
    const memberOrders = activeOrders.filter((order) => order.sellingMemberId === member.id);
    const directRevenue = memberOrders.reduce(
      (sum, order) => sum + order.quantity * order.unitPrice,
      0
    );
    const directCommission = memberOrders.reduce((sum, order) => {
      const product = tenantProducts.find((entry) => entry.id === order.productId);
      return sum + order.quantity * order.unitPrice * (product?.commissionableRate || 0);
    }, 0);

    const overrideCommission = activeOrders.reduce((sum, order) => {
      const sellingMember = tenantMembers.find((entry) => entry.id === order.sellingMemberId);
      if (sellingMember?.sponsorMemberId !== member.id) return sum;
      return sum + order.quantity * order.unitPrice * 0.05;
    }, 0);

    return {
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      sponsorName: memberDisplayName(member.sponsorMemberId),
      activeOrders: memberOrders.length,
      directRevenue,
      directCommission,
      overrideCommission,
      totalCommission: directCommission + overrideCommission
    } satisfies CommissionSummary;
  });

  return summaries.sort((left, right) => right.totalCommission - left.totalCommission);
}

export function listPayoutBatches() {
  const commissionSummary = listCommissionSummary().filter((entry) => entry.totalCommission > 0);
  const totalAmount = commissionSummary.reduce((sum, entry) => sum + entry.totalCommission, 0);

  const batches: PayoutBatch[] = [
    {
      id: 'payout_2026_04',
      periodLabel: 'April 2026',
      scheduledFor: '2026-04-30',
      status: 'draft',
      payeeCount: commissionSummary.length,
      totalAmount
    },
    {
      id: 'payout_2026_03',
      periodLabel: 'March 2026',
      scheduledFor: '2026-03-31',
      status: 'paid',
      payeeCount: 2,
      totalAmount: 112.5
    }
  ];

  return batches;
}
