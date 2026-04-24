import type {
  CommissionSummary,
  Customer,
  Member,
  Order,
  PayoutItem,
  PayoutBatch,
  Product,
  SalesGroup
} from './state.js';

export type SalesGroupRecord = SalesGroup;

export type MemberRecord = Member & {
  salesGroupName: string;
  sponsorName: string;
};

export type CustomerRecord = Customer & {
  ownerMemberName: string;
};

export type OrderRecord = Order & {
  customerName: string;
  productName: string;
  memberName: string;
  totalAmount: number;
};

export type BusinessRepository = {
  hasMember(memberId: string): boolean | Promise<boolean>;
  hasCustomer(customerId: string): boolean | Promise<boolean>;
  hasProduct(productId: string): boolean | Promise<boolean>;
  listSalesGroups(): Array<SalesGroupRecord> | Promise<Array<SalesGroupRecord>>;
  addSalesGroup(input: Omit<SalesGroup, 'id' | 'tenantSlug'>): SalesGroupRecord | Promise<SalesGroupRecord>;
  listMembers(): Array<MemberRecord> | Promise<Array<MemberRecord>>;
  addMember(input: Omit<Member, 'id' | 'tenantSlug'>): MemberRecord | Promise<MemberRecord>;
  listCustomers(): Array<CustomerRecord> | Promise<Array<CustomerRecord>>;
  addCustomer(input: Omit<Customer, 'id' | 'tenantSlug'>): CustomerRecord | Promise<CustomerRecord>;
  listProducts(): Array<Product> | Promise<Array<Product>>;
  listOrders(): Array<OrderRecord> | Promise<Array<OrderRecord>>;
  addOrder(input: Omit<Order, 'id' | 'tenantSlug'>): OrderRecord | Promise<OrderRecord>;
  listCommissionSummary(): Array<CommissionSummary> | Promise<Array<CommissionSummary>>;
  listPayoutBatches(): Array<PayoutBatch> | Promise<Array<PayoutBatch>>;
  listPayoutItems(): Array<PayoutItem> | Promise<Array<PayoutItem>>;
  approvePayoutBatch(batchId: string, actorEmail: string): PayoutBatch | Promise<PayoutBatch>;
  markPayoutBatchPaid(batchId: string, actorEmail: string): PayoutBatch | Promise<PayoutBatch>;
  voidPayoutBatch(batchId: string, actorEmail: string): PayoutBatch | Promise<PayoutBatch>;
  reopenPayoutBatch(batchId: string, actorEmail: string): PayoutBatch | Promise<PayoutBatch>;
};
