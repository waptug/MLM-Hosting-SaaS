import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BriefcaseBusiness,
  BadgeDollarSign,
  BookOpenText,
  Building2,
  MailPlus,
  LayoutDashboard,
  ListTree,
  Network,
  Palette,
  ScrollText,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Users
} from 'lucide-react';
import './styles.css';

type StepStatus = 'done' | 'active' | 'next';

type Milestone = {
  title: string;
  detail: string;
  status: StepStatus;
};

type SessionPayload = {
  tenant: {
    slug: string;
    name: string;
    themePreset: string;
    status: string;
  };
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  role: string;
};

type TenantSetup = {
  slug: string;
  name: string;
  themePreset: string;
  status: 'draft' | 'active';
  ownerEmail: string;
  supportEmail: string;
  brandLabel: string;
  primaryDomain: string;
  logoUrl: string;
  emailFromName: string;
  emailReplyTo: string;
  emailFooter: string;
};

type TenantUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type PermissionMatrixCell = {
  key: string;
  label: string;
  allowed: boolean;
};

type PermissionMatrixRow = {
  role: string;
  label: string;
  permissions: PermissionMatrixCell[];
};

type TenantInvitation = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  invitedByEmail: string;
  status: 'pending' | 'accepted' | 'revoked';
  expiresAt: string;
  createdAt: string;
  acceptanceToken?: string;
};

type DemoCredentials = {
  tenantSlug: string;
  email: string;
  password: string;
};

type EmailDeliveryLog = {
  id: string;
  recipientEmail: string;
  deliveryType: 'invitation' | 'password_reset';
  subjectLine: string;
  deliveryStatus: 'queued' | 'sent' | 'failed';
  tokenPreview: string;
  relatedEntityType: string;
  relatedEntityId: string;
  createdAt: string;
};

type SalesGroup = {
  id: string;
  name: string;
  code: string;
  region: string;
  managerEmail: string;
  status: 'draft' | 'active';
  notes: string;
};

type Member = {
  id: string;
  salesGroupId: string;
  salesGroupName: string;
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  status: 'prospect' | 'active' | 'paused';
  sponsorMemberId: string | null;
  sponsorName: string;
};

type Customer = {
  id: string;
  ownerMemberId: string;
  ownerMemberName: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'lead' | 'active' | 'past_due' | 'churned';
  monthlyRevenue: number;
  source: string;
  notes: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  billingCycle: 'monthly' | 'annual';
  unitPrice: number;
  commissionableRate: number;
  status: 'active' | 'retired';
};

type Order = {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  sellingMemberId: string;
  memberName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  billingCycle: 'monthly' | 'annual';
  status: 'pending' | 'active' | 'cancelled';
  placedAt: string;
};

type CommissionSummary = {
  memberId: string;
  memberName: string;
  sponsorName: string;
  activeOrders: number;
  directRevenue: number;
  directCommission: number;
  overrideCommission: number;
  totalCommission: number;
};

type CommissionPlanVersion = {
  id: string;
  planName: string;
  versionNumber: number;
  status: 'active' | 'draft' | 'retired';
  effectiveFrom: string;
  notes: string;
};

type CommissionRule = {
  id: string;
  planVersionId: string;
  ruleKey: string;
  ruleLabel: string;
  ruleType: 'direct' | 'override' | 'workflow' | 'qualification';
  levelNumber: number;
  percentRate: number;
  fixedAmount: number;
  rankFloor: string;
  notes: string;
};

type PayoutBatch = {
  id: string;
  periodLabel: string;
  scheduledFor: string;
  status: 'draft' | 'approved' | 'paid' | 'void';
  payeeCount: number;
  totalAmount: number;
  approvedAt?: string | null;
  approvedByEmail?: string;
  paidAt?: string | null;
  paidByEmail?: string;
};

type PayoutItem = {
  id: string;
  batchId: string;
  payeeMemberId: string;
  payeeMemberName: string;
  lineLabel: string;
  sourceSummary: string;
  directCommission: number;
  overrideCommission: number;
  totalAmount: number;
  orderCount: number;
  notes: string;
};

type CommissionSnapshot = {
  id: string;
  batchId: string;
  memberId: string;
  memberName: string;
  sponsorName: string;
  activeOrders: number;
  directRevenue: number;
  directCommission: number;
  overrideCommission: number;
  totalCommission: number;
  sourceLabel: string;
  notes: string;
};

type AuditLogEntry = {
  id: string;
  actorEmail: string;
  actionKey: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
};

type TenantSubscription = {
  id: string;
  tenantId: string;
  planKey: string;
  planName: string;
  billingInterval: 'monthly' | 'annual';
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  seatLimit: number;
  pricePerPeriod: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
};

type BillingInvoice = {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  periodLabel: string;
  issuedAt: string;
  dueAt: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  amountDue: number;
  amountPaid: number;
  balanceDue: number;
  notes: string;
};

type ManualSection = {
  title: string;
  summary: string;
  items: string[];
};

type TodoGroup = {
  title: string;
  items: string[];
};

type DeepDiveSection = {
  title: string;
  summary: string;
  bullets: string[];
};

const milestones: Milestone[] = [
  {
    title: 'Tenant foundation',
    detail: 'Organizations, users, roles, and tenant-scoped access.',
    status: 'active'
  },
  {
    title: 'Sales organization',
    detail: 'Sales groups, members, sponsors, and customer ownership.',
    status: 'next'
  },
  {
    title: 'Commerce and payouts',
    detail: 'Orders, commission plans, payout batches, and approval flows.',
    status: 'next'
  }
];

const workstreams = [
  {
    icon: Building2,
    title: 'Tenant Setup',
    text: 'Provision reseller workspaces with isolated data, owner accounts, and onboarding state.'
  },
  {
    icon: ShieldCheck,
    title: 'Roles and Access',
    text: 'Separate platform admin, tenant owner, manager, recruiter, and rep capabilities.'
  },
  {
    icon: Users,
    title: 'Sales Groups',
    text: 'Support multiple sales teams per tenant with hierarchy controls and reporting boundaries.'
  },
  {
    icon: BadgeDollarSign,
    title: 'Commissions',
    text: 'Prepare for versioned rules, direct sales payouts, multi-level overrides, and audits.'
  },
  {
    icon: Palette,
    title: 'White Label',
    text: 'Theme tokens, logos, branded login pages, and custom tenant domains.'
  },
  {
    icon: LayoutDashboard,
    title: 'Operational Reporting',
    text: 'Tenant KPIs, rep activity, pipeline visibility, and payout summaries.'
  }
];

const blankSetup: TenantSetup = {
  slug: '',
  name: '',
  themePreset: 'forest',
  status: 'draft',
  ownerEmail: '',
  supportEmail: '',
  brandLabel: '',
  primaryDomain: '',
  logoUrl: '',
  emailFromName: '',
  emailReplyTo: '',
  emailFooter: ''
};

const manualSections: ManualSection[] = [
  {
    title: '1. Workspace Setup',
    summary: 'Use the onboarding and user screens first so the tenant has branding, ownership, and operating roles in place.',
    items: [
      'Open Onboarding and set the tenant name, slug, brand label, support email, primary domain, theme preset, and status.',
      'Keep the workspace in draft status while you are configuring the reseller organization and testing workflows.',
      'Open Users and add the owner, managers, recruiters, sales reps, and finance users who will operate the tenant.',
      'Use finance_manager for payout review and tenant_manager for daily admin operations.'
    ]
  },
  {
    title: '2. Sales Organization',
    summary: 'Build the sales structure before loading customers and orders so attribution and hierarchy reports remain correct.',
    items: [
      'Create one or more Sales Groups for teams, regions, business units, or hosted brand programs.',
      'Add Members and assign each member to a sales group.',
      'Set a sponsor on each downstream member when you need multilevel override tracking.',
      'Use status values consistently: prospect for pipeline reps, active for commissionable reps, paused for temporary inactivity.'
    ]
  },
  {
    title: '3. Customer Management',
    summary: 'Every customer should have a clear owner member so revenue and commissions are tied to the right person.',
    items: [
      'Create Customers from the customer tab after the member hierarchy exists.',
      'Select the owner member carefully because this relationship drives downstream attribution.',
      'Use lead, active, past_due, and churned as operational states for customer lifecycle reporting.',
      'Capture monthly revenue, lead source, and notes so managers can review pipeline quality and retention risk.'
    ]
  },
  {
    title: '4. Orders and Revenue',
    summary: 'Orders are the source record for revenue and commission calculations in this SaaS.',
    items: [
      'Use Orders to select the customer, product, selling member, quantity, billing cycle, price, status, and placed date.',
      'Pending orders represent unconfirmed or not-yet-billable revenue and do not count toward current commission totals.',
      'Active orders are treated as commissionable revenue in the current ruleset.',
      'If pricing differs from the catalog default, change unit price on the order before saving.'
    ]
  },
  {
    title: '5. Commissions and Payouts',
    summary: 'The commission screen summarizes current direct revenue and sponsor override totals from active orders.',
    items: [
      'Direct commission is calculated from the product commissionable rate applied to active order revenue.',
      'Override commission is currently calculated as 5% of active direct-downline order revenue.',
      'Draft payout batches represent a payable period snapshot and can move through approve and paid states.',
      'Batch detail panels show payout line items and locked commission snapshots for historical reference.'
    ]
  },
  {
    title: '6. Billing and Subscriptions',
    summary: 'Tenant billing now lives in the app so SaaS operators can manage plan state and invoice history.',
    items: [
      'Open Billing to review the current tenant plan, billing interval, seat limit, and pricing.',
      'Use the edit form to adjust the active subscription for the tenant.',
      'Review the invoice list to track open and paid billing periods.',
      'Mark invoices paid when finance closes out the SaaS billing cycle.'
    ]
  },
  {
    title: '7. Recommended Operating Workflow',
    summary: 'This is the clean order of operations for a new tenant or reseller launch.',
    items: [
      'Configure onboarding and tenant users.',
      'Create sales groups.',
      'Create members and assign sponsors.',
      'Create customers.',
      'Enter orders.',
      'Review commissions and payout totals.',
      'Repeat customer and order entry as the business grows.'
    ]
  },
  {
    title: '8. Current Build Limits',
    summary: 'These notes matter for operating the current version correctly.',
    items: [
      'Tenant onboarding, tenant users, and the business domain are PostgreSQL-backed for the demo tenant.',
      'Password login, invitation acceptance, and session cookies are now active for the local demo tenant.',
      'Email delivery, password reset, billing/invoice workflows, and launch hardening are active for the current build.',
      'Session cookies now support production-friendly secure, domain, and SameSite settings.',
      'Unsafe browser requests are origin-checked, and new logins rotate older sessions for the same user.',
      'Audit logging now captures key admin create actions and setup updates.',
      'For the current local environment, the app expects DATABASE_URL to point at the Postgres container.'
    ]
  }
];

const productionTodoGroups: TodoGroup[] = [];

const productionLaunchOrder: string[] = [];

const deepDiveSections: DeepDiveSection[] = [
  {
    title: 'Runtime Layout',
    summary: 'The app is a monorepo with a React/Vite frontend, an Express API, and a dedicated database package.',
    bullets: [
      'apps/web is the browser client and owns the tabbed admin UI.',
      'apps/api exposes the HTTP routes and request authorization.',
      'packages/database owns migrations, the pool, and migration execution.',
      'packages/auth owns the shared role model and tenant context types.'
    ]
  },
  {
    title: 'Request Flow',
    summary: 'Every admin screen loads data from /api routes that read the current tenant from the session or headers.',
    bullets: [
      'The browser calls /api/session first to resolve tenant and user identity.',
      'attachTenantContext resolves the active tenant before protected routes run.',
      'requireRole gates access to admin and finance workflows.',
      'The web app reloads summary data after writes so the UI stays aligned with the database.'
    ]
  },
  {
    title: 'Data Model Strategy',
    summary: 'The domain is modeled in tenant-scoped tables so every reseller workspace stays isolated.',
    bullets: [
      'tenant_id is present on the operational tables and anchors every query.',
      'sales groups, members, customers, products, and orders form the core business graph.',
      'commission_plan_versions, commission_rules, payout_items, and commission_snapshots keep compensation history stable.',
      'tenant_subscriptions and billing_invoices capture SaaS billing state for the workspace itself.'
    ]
  },
  {
    title: 'Commission Engine',
    summary: 'Commissions are calculated from active orders and the seeded plan/rule set, then frozen into payout artifacts.',
    bullets: [
      'Direct commission uses each product commissionable_rate applied to active order revenue.',
      'Override commission uses the current level-1 rule in the active commission plan.',
      'Payout batches summarize the payable period, while payout_items hold the per-payee breakdown.',
      'commission_snapshots store the historical math so prior payouts do not change when rules change.'
    ]
  },
  {
    title: 'Auth and Identity',
    summary: 'Auth is session-cookie based, with invitation acceptance and password reset flows backed by PostgreSQL.',
    bullets: [
      'Passwords are hashed with scrypt and stored in users.password_hash.',
      'auth_sessions stores a hashed session token plus expiry and last-seen metadata.',
      'tenant_invitations and password_reset_tokens capture one-time onboarding actions.',
      'The demo login box is only for local development and seeded tenant access.'
    ]
  },
  {
    title: 'Migrations and Seeds',
    summary: 'The database is built incrementally with numbered SQL migrations and deterministic demo seed files.',
    bullets: [
      'Migrations are applied in numeric order by the database package runner.',
      'Seed files use fixed UUIDs so the integration tests can reference stable records.',
      'The local Postgres instance is expected to match the seeded demo tenant shape.',
      'When you add new tables, keep the seed and the integration suite in sync.'
    ]
  },
  {
    title: 'Validation Model',
    summary: 'The project uses typecheck, build, and API integration tests as the main safety net.',
    bullets: [
      'npm run typecheck validates the TypeScript surface across workspaces.',
      'npm run build compiles the packages and web bundle.',
      'npm run test:api rebuilds the database and API, then exercises the main tenant flows.',
      'The integration suite resets the demo records it mutates so repeated runs stay stable.'
    ]
  }
];

function StatusPill({ status }: { status: StepStatus }) {
  return <span className={`status-pill ${status}`}>{status === 'done' ? 'Done' : status === 'active' ? 'In Progress' : 'Queued'}</span>;
}

function OnboardingPanel({ setup, onSaved }: { setup: TenantSetup | null; onSaved: (setup: TenantSetup) => void }) {
  const [form, setForm] = React.useState<TenantSetup>(blankSetup);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (setup) setForm(setup);
  }, [setup]);

  function setField(field: keyof TenantSetup, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/onboarding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to save onboarding setup.');
      return;
    }

    onSaved(payload.setup);
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Tenant Onboarding</h2>
        <p>Configure the reseller workspace before sales groups and products are added.</p>
      </div>
      <form className="form-grid onboarding-form" onSubmit={submit}>
        <label>
          Tenant name
          <input value={form.name} onChange={(event) => setField('name', event.target.value)} />
        </label>
        <label>
          Tenant slug
          <input value={form.slug} onChange={(event) => setField('slug', event.target.value)} />
        </label>
        <label>
          Brand label
          <input value={form.brandLabel} onChange={(event) => setField('brandLabel', event.target.value)} />
        </label>
        <label>
          Primary domain
          <input value={form.primaryDomain} onChange={(event) => setField('primaryDomain', event.target.value)} />
        </label>
        <label>
          Logo URL
          <input value={form.logoUrl} onChange={(event) => setField('logoUrl', event.target.value)} />
        </label>
        <label>
          Email from name
          <input value={form.emailFromName} onChange={(event) => setField('emailFromName', event.target.value)} />
        </label>
        <label>
          Reply-to email
          <input value={form.emailReplyTo} onChange={(event) => setField('emailReplyTo', event.target.value)} />
        </label>
        <label className="full-width">
          Email footer
          <textarea value={form.emailFooter} onChange={(event) => setField('emailFooter', event.target.value)} rows={3} />
        </label>
        <label>
          Owner email
          <input value={form.ownerEmail} onChange={(event) => setField('ownerEmail', event.target.value)} />
        </label>
        <label>
          Support email
          <input value={form.supportEmail} onChange={(event) => setField('supportEmail', event.target.value)} />
        </label>
        <label>
          Theme preset
          <select value={form.themePreset} onChange={(event) => setField('themePreset', event.target.value)}>
            <option value="forest">forest</option>
            <option value="slate">slate</option>
            <option value="sunrise">sunrise</option>
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
            <option value="draft">draft</option>
            <option value="active">active</option>
          </select>
        </label>
        {error ? <p className="error full-width">{error}</p> : null}
        <div className="form-actions full-width">
          <button type="submit" className="primary" disabled={saving}>
            <Settings2 size={16} />
            {saving ? 'Saving' : 'Save onboarding'}
          </button>
        </div>
      </form>
    </section>
  );
}

function OverviewPanel({ session, setup }: { session: SessionPayload | null; setup: TenantSetup | null }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Tenant Session</h2>
        <p>Current tenant-aware auth and onboarding state from the API layer.</p>
      </div>
      {session ? (
        <dl className="session-list">
          <div>
            <dt>Tenant</dt>
            <dd>{session.tenant.name}</dd>
          </div>
          <div>
            <dt>Slug</dt>
            <dd>{session.tenant.slug}</dd>
          </div>
          <div>
            <dt>User</dt>
            <dd>
              {session.user.firstName} {session.user.lastName}
            </dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{session.role}</dd>
          </div>
          {setup ? (
            <>
              <div>
                <dt>Brand</dt>
                <dd>{setup.brandLabel}</dd>
              </div>
              <div>
                <dt>Domain</dt>
                <dd>{setup.primaryDomain}</dd>
              </div>
              <div>
                <dt>Logo</dt>
                <dd>{setup.logoUrl || 'not set'}</dd>
              </div>
              <div>
                <dt>Email From</dt>
                <dd>{setup.emailFromName || 'not set'}</dd>
              </div>
              <div>
                <dt>Reply To</dt>
                <dd>{setup.emailReplyTo || 'not set'}</dd>
              </div>
              <div className="full-width">
                <dt>Email Footer</dt>
                <dd>{setup.emailFooter || 'not set'}</dd>
              </div>
            </>
          ) : null}
        </dl>
      ) : (
        <p className="lede">Session context unavailable until the API is running.</p>
      )}
    </section>
  );
}

function UsersPanel({
  users,
  tenantRoles,
  onUserAdded
}: {
  users: TenantUser[];
  tenantRoles: string[];
  onUserAdded: (user: TenantUser) => void;
}) {
  const [form, setForm] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    role: tenantRoles[0] || 'sales_rep'
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (tenantRoles.length && !tenantRoles.includes(form.role)) {
      setForm((current) => ({ ...current, role: tenantRoles[0] }));
    }
  }, [tenantRoles, form.role]);

  const filteredUsers = users.filter((user) =>
    [user.firstName, user.lastName, user.email, user.role].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  function setField(field: 'email' | 'firstName' | 'lastName' | 'role', value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/tenant-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to add tenant user.');
      return;
    }

    onUserAdded(payload.user);
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      role: tenantRoles[0] || 'sales_rep'
    });
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Tenant Users</h2>
          <p>Current users and role assignments for this reseller workspace.</p>
        </div>
        <label className="inline-filter">
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter users" />
        </label>
        <div className="user-list">
          {filteredUsers.map((user) => (
            <div className="user-row" key={user.id}>
              <div>
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                <p>{user.email}</p>
              </div>
              <span className="status-pill next">{user.role}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Add Tenant User</h2>
          <p>Create the initial team that will manage recruiting, operations, and payouts.</p>
        </div>
        <form className="form-grid onboarding-form" onSubmit={submit}>
          <label>
            Email
            <input value={form.email} onChange={(event) => setField('email', event.target.value)} />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(event) => setField('role', event.target.value)}>
              {tenantRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            First name
            <input value={form.firstName} onChange={(event) => setField('firstName', event.target.value)} />
          </label>
          <label>
            Last name
            <input value={form.lastName} onChange={(event) => setField('lastName', event.target.value)} />
          </label>
          {error ? <p className="error full-width">{error}</p> : null}
          <div className="form-actions full-width">
            <button type="submit" className="primary" disabled={saving}>
              <MailPlus size={16} />
              {saving ? 'Saving' : 'Add user'}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

function InvitationsPanel({
  invitations,
  tenantRoles,
  deliveries,
  onInvitationAdded,
  onDeliveryLogged
}: {
  invitations: TenantInvitation[];
  tenantRoles: string[];
  deliveries: EmailDeliveryLog[];
  onInvitationAdded: (invitation: TenantInvitation) => void;
  onDeliveryLogged: (delivery: EmailDeliveryLog) => void;
}) {
  const [form, setForm] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    role: tenantRoles[0] || 'sales_rep',
    expiresInDays: '7'
  });
  const [saving, setSaving] = React.useState(false);
  const [sendingInvitationId, setSendingInvitationId] = React.useState('');
  const [revokingInvitationId, setRevokingInvitationId] = React.useState('');
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (tenantRoles.length && !tenantRoles.includes(form.role)) {
      setForm((current) => ({ ...current, role: tenantRoles[0] }));
    }
  }, [tenantRoles, form.role]);

  const filteredInvitations = invitations.filter((invitation) =>
    [invitation.firstName, invitation.lastName, invitation.email, invitation.role, invitation.status]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const filteredDeliveries = deliveries.filter((delivery) =>
    [delivery.recipientEmail, delivery.subjectLine, delivery.deliveryType, delivery.deliveryStatus]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function setField(field: 'email' | 'firstName' | 'lastName' | 'role' | 'expiresInDays', value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to create invitation.');
      return;
    }

    onInvitationAdded(payload.invitation);
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      role: tenantRoles[0] || 'sales_rep',
      expiresInDays: '7'
    });
  }

  async function sendInvitation(invitationId: string) {
    setSendingInvitationId(invitationId);
    setError('');

    const response = await fetch(`/api/admin/invitations/${invitationId}/send`, {
      method: 'POST'
    });
    const payload = await response.json();
    setSendingInvitationId('');

    if (!response.ok) {
      setError(payload.error || 'Unable to send invitation.');
      return;
    }

    onDeliveryLogged(payload.delivery);
  }

  async function revokeInvitation(invitationId: string) {
    setRevokingInvitationId(invitationId);
    setError('');

    const response = await fetch(`/api/admin/invitations/${invitationId}/revoke`, {
      method: 'POST'
    });
    const payload = await response.json();
    setRevokingInvitationId('');

    if (!response.ok) {
      setError(payload.error || 'Unable to revoke invitation.');
      return;
    }

    onInvitationAdded(payload.invitation);
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Pending Invitations</h2>
          <p>Invite future tenant users before they have active accounts.</p>
        </div>
        <label className="inline-filter">
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter invitations" />
        </label>
        <div className="user-list">
          {filteredInvitations.map((invitation) => (
            <div className="user-row" key={invitation.id}>
              <div>
                <strong>
                  {invitation.firstName} {invitation.lastName}
                </strong>
                <p>
                  {invitation.email} · {invitation.role} · invited by {invitation.invitedByEmail || 'system'}
                </p>
                <p>expires: {new Date(invitation.expiresAt).toLocaleString()}</p>
                {invitation.acceptanceToken ? <p>token: {invitation.acceptanceToken}</p> : null}
              </div>
              <div className="batch-actions">
                <span className={`status-pill ${invitation.status === 'accepted' ? 'done' : invitation.status === 'revoked' ? 'active' : 'next'}`}>
                  {invitation.status}
                </span>
                {invitation.status === 'pending' ? (
                  <div className="batch-actions">
                    <button
                      type="button"
                      className="primary"
                      disabled={sendingInvitationId === invitation.id}
                      onClick={() => sendInvitation(invitation.id)}
                    >
                      {sendingInvitationId === invitation.id ? 'Sending' : 'Send invite'}
                    </button>
                    <button
                      type="button"
                      disabled={revokingInvitationId === invitation.id}
                      onClick={() => revokeInvitation(invitation.id)}
                    >
                      {revokingInvitationId === invitation.id ? 'Saving' : 'Revoke'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Create Invitation</h2>
          <p>Issue a pending invitation with tenant role and expiry tracking.</p>
        </div>
        <form className="form-grid onboarding-form" onSubmit={submit}>
          <label>
            Email
            <input value={form.email} onChange={(event) => setField('email', event.target.value)} />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(event) => setField('role', event.target.value)}>
              {tenantRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Expires in days
            <input
              type="number"
              min={1}
              max={90}
              value={form.expiresInDays}
              onChange={(event) => setField('expiresInDays', event.target.value)}
            />
          </label>
          <label>
            First name
            <input value={form.firstName} onChange={(event) => setField('firstName', event.target.value)} />
          </label>
          <label>
            Last name
            <input value={form.lastName} onChange={(event) => setField('lastName', event.target.value)} />
          </label>
          {error ? <p className="error full-width">{error}</p> : null}
          <div className="form-actions full-width">
            <button type="submit" className="primary" disabled={saving}>
              <MailPlus size={16} />
              {saving ? 'Saving' : 'Create invitation'}
            </button>
          </div>
        </form>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Delivery Log</h2>
          <p>Simulated invitation and reset deliveries recorded for the tenant.</p>
        </div>
        <div className="user-list">
          {filteredDeliveries.map((delivery) => (
            <div className="user-row" key={delivery.id}>
              <div>
                <strong>{delivery.subjectLine}</strong>
                <p>
                  {delivery.recipientEmail} · {delivery.deliveryType} · {delivery.deliveryStatus}
                </p>
                {delivery.tokenPreview ? <p>token: {delivery.tokenPreview}</p> : null}
              </div>
              <span className="status-pill next">{new Date(delivery.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function SalesGroupsPanel({
  salesGroups,
  onGroupAdded
}: {
  salesGroups: SalesGroup[];
  onGroupAdded: (group: SalesGroup) => void;
}) {
  const [form, setForm] = React.useState({
    name: '',
    code: '',
    region: '',
    managerEmail: 'manager@example.com',
    status: 'draft',
    notes: ''
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');

  const filteredGroups = salesGroups.filter((group) =>
    [group.name, group.code, group.region, group.managerEmail, group.status, group.notes]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/sales-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to add sales group.');
      return;
    }

    onGroupAdded(payload.salesGroup);
    setForm({
      name: '',
      code: '',
      region: '',
      managerEmail: 'manager@example.com',
      status: 'draft',
      notes: ''
    });
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Sales Groups</h2>
          <p>Team structures that will own recruiters, reps, and hierarchy reporting.</p>
        </div>
        <label className="inline-filter">
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter groups" />
        </label>
        <div className="user-list">
          {filteredGroups.map((group) => (
            <div className="user-row" key={group.id}>
              <div>
                <strong>{group.name}</strong>
                <p>{group.code} · {group.region || 'Unassigned region'} · {group.managerEmail}</p>
              </div>
              <span className={`status-pill ${group.status === 'active' ? 'done' : 'next'}`}>{group.status}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Add Sales Group</h2>
          <p>Create the team containers that members and downlines will belong to next.</p>
        </div>
        <form className="form-grid onboarding-form" onSubmit={submit}>
          <label>
            Group name
            <input value={form.name} onChange={(event) => setField('name', event.target.value)} />
          </label>
          <label>
            Group code
            <input value={form.code} onChange={(event) => setField('code', event.target.value)} />
          </label>
          <label>
            Region
            <input value={form.region} onChange={(event) => setField('region', event.target.value)} />
          </label>
          <label>
            Manager email
            <input value={form.managerEmail} onChange={(event) => setField('managerEmail', event.target.value)} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="draft">draft</option>
              <option value="active">active</option>
            </select>
          </label>
          <label>
            Notes
            <input value={form.notes} onChange={(event) => setField('notes', event.target.value)} />
          </label>
          {error ? <p className="error full-width">{error}</p> : null}
          <div className="form-actions full-width">
            <button type="submit" className="primary" disabled={saving}>
              <Network size={16} />
              {saving ? 'Saving' : 'Add sales group'}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

function MembersPanel({
  members,
  salesGroups,
  onMemberAdded
}: {
  members: Member[];
  salesGroups: SalesGroup[];
  onMemberAdded: (member: Member) => void;
}) {
  const [form, setForm] = React.useState({
    salesGroupId: salesGroups[0]?.id || '',
    firstName: '',
    lastName: '',
    email: '',
    roleTitle: '',
    status: 'prospect',
    sponsorMemberId: ''
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (salesGroups.length && !form.salesGroupId) {
      setForm((current) => ({ ...current, salesGroupId: salesGroups[0].id }));
    }
  }, [salesGroups, form.salesGroupId]);

  const filteredMembers = members.filter((member) =>
    [member.firstName, member.lastName, member.email, member.roleTitle, member.status, member.sponsorName, member.salesGroupName]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to add member.');
      return;
    }

    onMemberAdded(payload.member);
    setForm({
      salesGroupId: salesGroups[0]?.id || '',
      firstName: '',
      lastName: '',
      email: '',
      roleTitle: '',
      status: 'prospect',
      sponsorMemberId: ''
    });
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Member Hierarchy</h2>
          <p>Members belong to sales groups and can be linked to sponsors for multilevel reporting.</p>
        </div>
        <label className="inline-filter">
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter members" />
        </label>
        <div className="user-list">
          {filteredMembers.map((member) => (
            <div className="user-row" key={member.id}>
              <div>
                <strong>{member.firstName} {member.lastName}</strong>
                <p>{member.salesGroupName} · {member.roleTitle || 'Rep'} · sponsor: {member.sponsorName || 'none'}</p>
              </div>
              <span className={`status-pill ${member.status === 'active' ? 'done' : member.status === 'paused' ? 'next' : 'active'}`}>
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Add Member</h2>
          <p>Create the first hierarchy entries that will later own customers, orders, and commissions.</p>
        </div>
        <form className="form-grid onboarding-form" onSubmit={submit}>
          <label>
            Sales group
            <select value={form.salesGroupId} onChange={(event) => setField('salesGroupId', event.target.value)}>
              {salesGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sponsor
            <select value={form.sponsorMemberId} onChange={(event) => setField('sponsorMemberId', event.target.value)}>
              <option value="">No sponsor</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            First name
            <input value={form.firstName} onChange={(event) => setField('firstName', event.target.value)} />
          </label>
          <label>
            Last name
            <input value={form.lastName} onChange={(event) => setField('lastName', event.target.value)} />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(event) => setField('email', event.target.value)} />
          </label>
          <label>
            Role title
            <input value={form.roleTitle} onChange={(event) => setField('roleTitle', event.target.value)} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="prospect">prospect</option>
              <option value="active">active</option>
              <option value="paused">paused</option>
            </select>
          </label>
          {error ? <p className="error full-width">{error}</p> : null}
          <div className="form-actions full-width">
            <button type="submit" className="primary" disabled={saving}>
              <ListTree size={16} />
              {saving ? 'Saving' : 'Add member'}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

function CustomersPanel({
  customers,
  members,
  onCustomerAdded
}: {
  customers: Customer[];
  members: Member[];
  onCustomerAdded: (customer: Customer) => void;
}) {
  const [form, setForm] = React.useState({
    ownerMemberId: members[0]?.id || '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    status: 'lead',
    monthlyRevenue: '0',
    source: '',
    notes: ''
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const filteredCustomers = customers.filter((customer) =>
    [
      customer.companyName,
      customer.contactName,
      customer.email,
      customer.phone,
      customer.status,
      customer.source,
      customer.ownerMemberName
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (members.length && !form.ownerMemberId) {
      setForm((current) => ({ ...current, ownerMemberId: members[0].id }));
    }
  }, [members, form.ownerMemberId]);

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        monthlyRevenue: Number(form.monthlyRevenue || '0')
      })
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to add customer.');
      return;
    }

    onCustomerAdded(payload.customer);
    setForm({
      ownerMemberId: members[0]?.id || '',
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      status: 'lead',
      monthlyRevenue: '0',
      source: '',
      notes: ''
    });
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Customers</h2>
          <p>Customers are attached to members so account ownership, revenue, and later commissions can be traced cleanly.</p>
        </div>
        <label className="inline-filter">
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter customers" />
        </label>
        <div className="user-list">
          {filteredCustomers.map((customer) => (
            <div className="user-row" key={customer.id}>
              <div>
                <strong>{customer.companyName}</strong>
                <p>
                  {customer.contactName} · {customer.ownerMemberName || 'Unassigned'} · ${customer.monthlyRevenue}/mo
                </p>
              </div>
              <span
                className={`status-pill ${
                  customer.status === 'active'
                    ? 'done'
                    : customer.status === 'past_due' || customer.status === 'churned'
                      ? 'next'
                      : 'active'
                }`}
              >
                {customer.status}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Add Customer</h2>
          <p>Capture account ownership now so orders, renewals, and payouts have the right attribution later.</p>
        </div>
        <form className="form-grid onboarding-form" onSubmit={submit}>
          <label>
            Owner member
            <select value={form.ownerMemberId} onChange={(event) => setField('ownerMemberId', event.target.value)}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="lead">lead</option>
              <option value="active">active</option>
              <option value="past_due">past_due</option>
              <option value="churned">churned</option>
            </select>
          </label>
          <label>
            Company name
            <input value={form.companyName} onChange={(event) => setField('companyName', event.target.value)} />
          </label>
          <label>
            Contact name
            <input value={form.contactName} onChange={(event) => setField('contactName', event.target.value)} />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(event) => setField('email', event.target.value)} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => setField('phone', event.target.value)} />
          </label>
          <label>
            Monthly revenue
            <input value={form.monthlyRevenue} onChange={(event) => setField('monthlyRevenue', event.target.value)} />
          </label>
          <label>
            Lead source
            <input value={form.source} onChange={(event) => setField('source', event.target.value)} />
          </label>
          <label className="full-width">
            Notes
            <input value={form.notes} onChange={(event) => setField('notes', event.target.value)} />
          </label>
          {error ? <p className="error full-width">{error}</p> : null}
          <div className="form-actions full-width">
            <button type="submit" className="primary" disabled={saving}>
              <BriefcaseBusiness size={16} />
              {saving ? 'Saving' : 'Add customer'}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

function OrdersPanel({
  orders,
  products,
  customers,
  members,
  onOrderAdded
}: {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  members: Member[];
  onOrderAdded: (order: Order) => void;
}) {
  const [form, setForm] = React.useState({
    customerId: customers[0]?.id || '',
    productId: products[0]?.id || '',
    sellingMemberId: members[0]?.id || '',
    quantity: '1',
    unitPrice: products[0] ? String(products[0].unitPrice) : '0',
    billingCycle: products[0]?.billingCycle || 'monthly',
    status: 'pending',
    placedAt: '2026-04-23'
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');

  const filteredOrders = orders.filter((order) =>
    [
      order.customerName,
      order.productName,
      order.memberName,
      order.billingCycle,
      order.status,
      order.placedAt,
      String(order.totalAmount)
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (customers.length && !form.customerId) {
      setForm((current) => ({ ...current, customerId: customers[0].id }));
    }
    if (products.length && !form.productId) {
      setForm((current) => ({
        ...current,
        productId: products[0].id,
        unitPrice: String(products[0].unitPrice),
        billingCycle: products[0].billingCycle
      }));
    }
    if (members.length && !form.sellingMemberId) {
      setForm((current) => ({ ...current, sellingMemberId: members[0].id }));
    }
  }, [customers, form.customerId, form.productId, form.sellingMemberId, members, products]);

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setProduct(productId: string) {
    const product = products.find((entry) => entry.id === productId);
    setForm((current) => ({
      ...current,
      productId,
      unitPrice: product ? String(product.unitPrice) : current.unitPrice,
      billingCycle: product ? product.billingCycle : current.billingCycle
    }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity || '1'),
        unitPrice: Number(form.unitPrice || '0')
      })
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to add order.');
      return;
    }

    onOrderAdded(payload.order);
    setForm({
      customerId: customers[0]?.id || '',
      productId: products[0]?.id || '',
      sellingMemberId: members[0]?.id || '',
      quantity: '1',
      unitPrice: products[0] ? String(products[0].unitPrice) : '0',
      billingCycle: products[0]?.billingCycle || 'monthly',
      status: 'pending',
      placedAt: '2026-04-23'
    });
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Orders</h2>
          <p>Orders connect the customer record, product sold, and member credited for the sale.</p>
        </div>
        <label className="inline-filter">
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter orders" />
        </label>
        <div className="user-list">
          {filteredOrders.map((order) => (
            <div className="user-row" key={order.id}>
              <div>
                <strong>{order.customerName} · {order.productName}</strong>
                <p>
                  {order.memberName || 'Unassigned'} · {order.quantity} x ${order.unitPrice} · {order.billingCycle} · {order.placedAt}
                </p>
              </div>
              <span className={`status-pill ${order.status === 'active' ? 'done' : order.status === 'cancelled' ? 'next' : 'active'}`}>
                ${order.totalAmount}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Enter Order</h2>
          <p>Use the hosted product catalog to record new business and feed the later payout engine.</p>
        </div>
        <form className="form-grid onboarding-form" onSubmit={submit}>
          <label>
            Customer
            <select value={form.customerId} onChange={(event) => setField('customerId', event.target.value)}>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.companyName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product
            <select value={form.productId} onChange={(event) => setProduct(event.target.value)}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Selling member
            <select value={form.sellingMemberId} onChange={(event) => setField('sellingMemberId', event.target.value)}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="pending">pending</option>
              <option value="active">active</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label>
            Quantity
            <input value={form.quantity} onChange={(event) => setField('quantity', event.target.value)} />
          </label>
          <label>
            Unit price
            <input value={form.unitPrice} onChange={(event) => setField('unitPrice', event.target.value)} />
          </label>
          <label>
            Billing cycle
            <select value={form.billingCycle} onChange={(event) => setField('billingCycle', event.target.value)}>
              <option value="monthly">monthly</option>
              <option value="annual">annual</option>
            </select>
          </label>
          <label>
            Placed at
            <input value={form.placedAt} onChange={(event) => setField('placedAt', event.target.value)} />
          </label>
          {error ? <p className="error full-width">{error}</p> : null}
          <div className="form-actions full-width">
            <button type="submit" className="primary" disabled={saving}>
              <ShoppingCart size={16} />
              {saving ? 'Saving' : 'Create order'}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

function CommissionsPanel({
  summaries,
  payouts,
  payoutItems,
  commissionSnapshots,
  plans,
  rules,
  auditLogs,
  onBatchUpdated
}: {
  summaries: CommissionSummary[];
  payouts: PayoutBatch[];
  payoutItems: PayoutItem[];
  commissionSnapshots: CommissionSnapshot[];
  plans: CommissionPlanVersion[];
  rules: CommissionRule[];
  auditLogs: AuditLogEntry[];
  onBatchUpdated: (batch: PayoutBatch) => void;
}) {
  const totals = summaries.reduce(
    (accumulator, summary) => ({
      directRevenue: accumulator.directRevenue + summary.directRevenue,
      directCommission: accumulator.directCommission + summary.directCommission,
      overrideCommission: accumulator.overrideCommission + summary.overrideCommission,
      totalCommission: accumulator.totalCommission + summary.totalCommission
    }),
    {
      directRevenue: 0,
      directCommission: 0,
      overrideCommission: 0,
      totalCommission: 0
    }
  );
  const [savingBatchId, setSavingBatchId] = React.useState('');
  const [error, setError] = React.useState('');
  const [selectedBatchId, setSelectedBatchId] = React.useState(payouts[0]?.id || '');

  React.useEffect(() => {
    if (!payouts.length) {
      setSelectedBatchId('');
      return;
    }

    if (!selectedBatchId || !payouts.some((batch) => batch.id === selectedBatchId)) {
      setSelectedBatchId(payouts[0].id);
    }
  }, [payouts, selectedBatchId]);

  const selectedBatch = payouts.find((batch) => batch.id === selectedBatchId) || null;
  const selectedBatchItems = payoutItems.filter((item) => item.batchId === selectedBatchId);
  const selectedBatchSnapshots = commissionSnapshots.filter((snapshot) => snapshot.batchId === selectedBatchId);
  const selectedBatchHistory = auditLogs.filter((entry) => entry.entityType === 'payout_batch' && entry.entityId === selectedBatchId);

  async function runBatchAction(batchId: string, action: 'approve' | 'pay' | 'void' | 'reopen') {
    setSavingBatchId(batchId);
    setError('');

    const response = await fetch(`/api/admin/payouts/${batchId}/${action}`, {
      method: 'POST'
    });
    const payload = await response.json();
    setSavingBatchId('');

    if (!response.ok) {
      setError(payload.error || `Unable to ${action} payout batch.`);
      return;
    }

    onBatchUpdated(payload.batch);
  }

  return (
    <>
      <section className="grid stats-grid">
        <article className="stat-card">
          <span>Direct revenue</span>
          <strong>${totals.directRevenue.toFixed(2)}</strong>
        </article>
        <article className="stat-card">
          <span>Direct commission</span>
          <strong>${totals.directCommission.toFixed(2)}</strong>
        </article>
        <article className="stat-card">
          <span>Override commission</span>
          <strong>${totals.overrideCommission.toFixed(2)}</strong>
        </article>
        <article className="stat-card">
          <span>Pending payout total</span>
          <strong>${totals.totalCommission.toFixed(2)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Commission Summary</h2>
            <p>Direct commissions come from the sold product rate. Sponsor overrides come from the active commission plan rules.</p>
          </div>
          <div className="user-list">
            {summaries.map((summary) => (
              <div className="user-row" key={summary.memberId}>
                <div>
                  <strong>{summary.memberName}</strong>
                  <p>
                    {summary.activeOrders} active orders · sponsor: {summary.sponsorName || 'none'} · revenue $
                    {summary.directRevenue.toFixed(2)}
                  </p>
                </div>
                <span className="status-pill done">${summary.totalCommission.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Payout Batches</h2>
            <p>Draft and historical payout periods visible to finance and tenant admins.</p>
          </div>
          {error ? <p className="error">{error}</p> : null}
          <div className="user-list">
            {payouts.map((batch) => (
              <div className="user-row" key={batch.id}>
                <div>
                  <strong>{batch.periodLabel}</strong>
                  <p>
                    {batch.payeeCount} payees · scheduled {batch.scheduledFor}
                  </p>
                  <p>
                    {batch.status === 'approved' && batch.approvedByEmail
                      ? `approved by ${batch.approvedByEmail}`
                      : batch.status === 'paid' && batch.paidByEmail
                        ? `paid by ${batch.paidByEmail}`
                        : 'awaiting finance action'}
                  </p>
                </div>
                <div className="batch-actions">
                  <span className={`status-pill ${batch.status === 'paid' ? 'done' : batch.status === 'approved' ? 'active' : 'next'}`}>
                    ${batch.totalAmount.toFixed(2)}
                  </span>
                  <button type="button" onClick={() => setSelectedBatchId(batch.id)}>
                    View items
                  </button>
                  <button type="button" onClick={() => window.open(`/api/admin/payouts/${batch.id}/export`, '_blank', 'noopener,noreferrer')}>
                    Export CSV
                  </button>
                  {batch.status === 'draft' ? (
                    <button
                      type="button"
                      className="primary"
                      disabled={savingBatchId === batch.id}
                      onClick={() => runBatchAction(batch.id, 'approve')}
                    >
                      {savingBatchId === batch.id ? 'Saving' : 'Approve'}
                    </button>
                  ) : null}
                  {batch.status === 'approved' ? (
                    <>
                      <button
                        type="button"
                        className="primary"
                        disabled={savingBatchId === batch.id}
                        onClick={() => runBatchAction(batch.id, 'pay')}
                      >
                        {savingBatchId === batch.id ? 'Saving' : 'Mark paid'}
                      </button>
                      <button
                        type="button"
                        disabled={savingBatchId === batch.id}
                        onClick={() => runBatchAction(batch.id, 'void')}
                      >
                        {savingBatchId === batch.id ? 'Saving' : 'Void'}
                      </button>
                    </>
                  ) : null}
                  {batch.status === 'void' ? (
                    <button
                      type="button"
                      className="primary"
                      disabled={savingBatchId === batch.id}
                      onClick={() => runBatchAction(batch.id, 'reopen')}
                    >
                      {savingBatchId === batch.id ? 'Saving' : 'Reopen'}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Batch Line Items</h2>
            <p>Detailed commission rows for the selected payout batch.</p>
          </div>
          {selectedBatch ? (
            <div className="user-list">
              <div className="user-row">
                <div>
                  <strong>{selectedBatch.periodLabel}</strong>
                  <p>
                    {selectedBatch.payeeCount} payees · ${selectedBatch.totalAmount.toFixed(2)} total
                  </p>
                </div>
                <span className={`status-pill ${selectedBatch.status === 'paid' ? 'done' : selectedBatch.status === 'approved' ? 'active' : 'next'}`}>
                  {selectedBatch.status}
                </span>
              </div>
              {selectedBatchItems.map((item) => (
                <div className="user-row" key={item.id}>
                  <div>
                    <strong>{item.payeeMemberName || 'Unassigned payee'}</strong>
                    <p>
                      {item.lineLabel} · {item.orderCount} orders · direct ${item.directCommission.toFixed(2)} · override $
                      {item.overrideCommission.toFixed(2)}
                    </p>
                    <p>
                      {item.sourceSummary}
                      {item.notes ? ` · ${item.notes}` : ''}
                    </p>
                  </div>
                  <span className="status-pill done">${item.totalAmount.toFixed(2)}</span>
                </div>
              ))}
              {!selectedBatchItems.length ? <p className="empty-state">No line items are attached to this payout batch yet.</p> : null}
            </div>
          ) : (
            <p className="empty-state">Select a payout batch to view its line items.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Commission Snapshots</h2>
            <p>Historical payout math captured at the time each batch was prepared.</p>
          </div>
          {selectedBatch ? (
            <div className="user-list">
              {selectedBatchSnapshots.map((snapshot) => (
                <div className="user-row" key={snapshot.id}>
                  <div>
                    <strong>{snapshot.memberName}</strong>
                    <p>
                      {snapshot.activeOrders} orders · direct ${snapshot.directCommission.toFixed(2)} · override $
                      {snapshot.overrideCommission.toFixed(2)} · revenue ${snapshot.directRevenue.toFixed(2)}
                    </p>
                    <p>
                      {snapshot.sourceLabel}
                      {snapshot.notes ? ` · ${snapshot.notes}` : ''}
                    </p>
                  </div>
                  <span className="status-pill done">${snapshot.totalCommission.toFixed(2)}</span>
                </div>
              ))}
              {!selectedBatchSnapshots.length ? (
                <p className="empty-state">No snapshots exist for the selected payout batch yet.</p>
              ) : null}
            </div>
          ) : (
            <p className="empty-state">Select a payout batch to inspect its snapshot history.</p>
          )}
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Payout History</h2>
            <p>Approval, payment, void, and reopen events captured in the audit log.</p>
          </div>
          {selectedBatch ? (
            <div className="user-list">
              {selectedBatchHistory.map((entry) => (
                <div className="user-row" key={entry.id}>
                  <div>
                    <strong>{entry.summary}</strong>
                    <p>
                      {entry.actorEmail || 'system'} · {entry.actionKey}
                    </p>
                  </div>
                  <span className="status-pill next">{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {!selectedBatchHistory.length ? <p className="empty-state">No payout history exists for the selected batch yet.</p> : null}
            </div>
          ) : (
            <p className="empty-state">Select a payout batch to inspect its approval history.</p>
          )}
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Commission Plans</h2>
            <p>Versioned plan headers for the tenant compensation engine.</p>
          </div>
          <div className="user-list">
            {plans.map((plan) => (
              <div className="user-row" key={plan.id}>
                <div>
                  <strong>
                    {plan.planName} v{plan.versionNumber}
                  </strong>
                  <p>
                    effective {plan.effectiveFrom} · {plan.notes || 'no notes'}
                  </p>
                </div>
                <span className={`status-pill ${plan.status === 'active' ? 'done' : plan.status === 'draft' ? 'next' : 'active'}`}>
                  {plan.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Commission Rules</h2>
            <p>Persisted rule rows used by the summary and payout logic.</p>
          </div>
          <div className="user-list">
            {rules.map((rule) => (
              <div className="user-row" key={rule.id}>
                <div>
                  <strong>{rule.ruleLabel}</strong>
                  <p>
                    {rule.ruleType} · level {rule.levelNumber} · {(rule.percentRate * 100).toFixed(2)}%
                  </p>
                </div>
                <span className="status-pill next">{rule.ruleKey}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function BillingPanel({
  subscription,
  invoices,
  onSubscriptionSaved,
  onInvoicePaid
}: {
  subscription: TenantSubscription;
  invoices: BillingInvoice[];
  onSubscriptionSaved: (subscription: TenantSubscription) => void;
  onInvoicePaid: (invoice: BillingInvoice) => void;
}) {
  const [form, setForm] = React.useState({
    planKey: subscription.planKey,
    planName: subscription.planName,
    billingInterval: subscription.billingInterval,
    status: subscription.status,
    seatLimit: String(subscription.seatLimit),
    pricePerPeriod: String(subscription.pricePerPeriod),
    currency: subscription.currency,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEndsAt: subscription.trialEndsAt || '',
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
  });
  const [saving, setSaving] = React.useState(false);
  const [invoiceSavingId, setInvoiceSavingId] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setForm({
      planKey: subscription.planKey,
      planName: subscription.planName,
      billingInterval: subscription.billingInterval,
      status: subscription.status,
      seatLimit: String(subscription.seatLimit),
      pricePerPeriod: String(subscription.pricePerPeriod),
      currency: subscription.currency,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEndsAt: subscription.trialEndsAt || '',
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    });
  }, [subscription]);

  function setField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/billing/subscription', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        seatLimit: Number(form.seatLimit || '0'),
        pricePerPeriod: Number(form.pricePerPeriod || '0'),
        trialEndsAt: form.trialEndsAt || null
      })
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to save billing subscription.');
      return;
    }

    onSubscriptionSaved(payload.subscription);
  }

  async function payInvoice(invoiceId: string) {
    setInvoiceSavingId(invoiceId);
    setError('');

    const response = await fetch(`/api/admin/billing/invoices/${invoiceId}/pay`, {
      method: 'POST'
    });
    const payload = await response.json();
    setInvoiceSavingId('');

    if (!response.ok) {
      setError(payload.error || 'Unable to mark invoice paid.');
      return;
    }

    onInvoicePaid(payload.invoice);
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Subscription</h2>
          <p>Tenant billing state for SaaS access and seat limits.</p>
        </div>
        <div className="user-list">
          <div className="user-row">
            <div>
              <strong>
                {subscription.planName} · {subscription.billingInterval}
              </strong>
              <p>
                {subscription.status} · {subscription.seatLimit} seats · ${subscription.pricePerPeriod.toFixed(2)}
              </p>
              <p>
                period {subscription.currentPeriodStart} to {subscription.currentPeriodEnd}
              </p>
            </div>
            <span className={`status-pill ${subscription.status === 'active' ? 'done' : subscription.status === 'trialing' ? 'active' : 'next'}`}>
              {subscription.cancelAtPeriodEnd ? 'cancels at end' : subscription.status}
            </span>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Edit Subscription</h2>
          <p>Manage the tenant plan, billing cadence, and seat limits.</p>
        </div>
        <form className="form-grid onboarding-form" onSubmit={submit}>
          <label>
            Plan key
            <input value={form.planKey} onChange={(event) => setField('planKey', event.target.value)} />
          </label>
          <label>
            Plan name
            <input value={form.planName} onChange={(event) => setField('planName', event.target.value)} />
          </label>
          <label>
            Billing interval
            <select value={form.billingInterval} onChange={(event) => setField('billingInterval', event.target.value)}>
              <option value="monthly">monthly</option>
              <option value="annual">annual</option>
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option value="trialing">trialing</option>
              <option value="active">active</option>
              <option value="past_due">past_due</option>
              <option value="canceled">canceled</option>
            </select>
          </label>
          <label>
            Seat limit
            <input value={form.seatLimit} onChange={(event) => setField('seatLimit', event.target.value)} />
          </label>
          <label>
            Price per period
            <input value={form.pricePerPeriod} onChange={(event) => setField('pricePerPeriod', event.target.value)} />
          </label>
          <label>
            Currency
            <input value={form.currency} onChange={(event) => setField('currency', event.target.value)} />
          </label>
          <label>
            Current period start
            <input value={form.currentPeriodStart} onChange={(event) => setField('currentPeriodStart', event.target.value)} />
          </label>
          <label>
            Current period end
            <input value={form.currentPeriodEnd} onChange={(event) => setField('currentPeriodEnd', event.target.value)} />
          </label>
          <label>
            Trial ends at
            <input value={form.trialEndsAt} onChange={(event) => setField('trialEndsAt', event.target.value)} />
          </label>
          <label>
            Cancel at period end
            <select
              value={form.cancelAtPeriodEnd ? 'true' : 'false'}
              onChange={(event) => setField('cancelAtPeriodEnd', event.target.value === 'true')}
            >
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </label>
          {error ? <p className="error full-width">{error}</p> : null}
          <div className="form-actions full-width">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving' : 'Save subscription'}
            </button>
          </div>
        </form>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Invoices</h2>
          <p>Invoice history for the tenant subscription.</p>
        </div>
        <div className="user-list">
          {invoices.map((invoice) => (
            <div className="user-row" key={invoice.id}>
              <div>
                <strong>
                  {invoice.invoiceNumber} · {invoice.periodLabel}
                </strong>
                <p>
                  issued {invoice.issuedAt} · due {invoice.dueAt} · paid ${invoice.amountPaid.toFixed(2)} / $
                  {invoice.amountDue.toFixed(2)}
                </p>
                <p>{invoice.notes}</p>
              </div>
              <div className="batch-actions">
                <span className={`status-pill ${invoice.status === 'paid' ? 'done' : invoice.status === 'open' ? 'active' : 'next'}`}>
                  ${invoice.balanceDue.toFixed(2)}
                </span>
                {invoice.status !== 'paid' ? (
                  <button
                    type="button"
                    className="primary"
                    disabled={invoiceSavingId === invoice.id}
                    onClick={() => payInvoice(invoice.id)}
                  >
                    {invoiceSavingId === invoice.id ? 'Saving' : 'Mark paid'}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function ManualPanel() {
  const [manualView, setManualView] = React.useState<'guide' | 'production' | 'developer'>('guide');

  return (
    <section className="panel manual-panel">
      <div className="panel-heading">
        <h2>User Manual</h2>
        <p>Operational guide for tenant admins, recruiters, sales managers, and finance users.</p>
      </div>
      <nav className="subtabs manual-subtabs" aria-label="Manual sections">
        <button className={manualView === 'guide' ? 'active' : ''} onClick={() => setManualView('guide')}>
          Guide
        </button>
        <button className={manualView === 'production' ? 'active' : ''} onClick={() => setManualView('production')}>
          Production To-Do
        </button>
        <button className={manualView === 'developer' ? 'active' : ''} onClick={() => setManualView('developer')}>
          Developer Deep Dive
        </button>
      </nav>
      {manualView === 'guide' ? (
        <div className="manual-grid">
          {manualSections.map((section) => (
            <article className="manual-section" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.summary}</p>
              <ul className="manual-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : manualView === 'production' ? (
        <div className="manual-grid">
          <article className="manual-section manual-section-wide">
            <h3>What Is Left To Complete For Production Site</h3>
            <p>The production launch checklist is complete.</p>
            {productionTodoGroups.length ? (
              <div className="todo-groups">
                {productionTodoGroups.map((group) => (
                  <section className="todo-group" key={group.title}>
                    <h4>{group.title}</h4>
                    <ul className="manual-list todo-list">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <p className="empty-state">Production launch checklist complete.</p>
            )}
          </article>
          <article className="manual-section">
            <h3>Shortest Path To Production Launch</h3>
            <p>There is no remaining launch order because the checklist is complete.</p>
            {productionLaunchOrder.length ? (
              <ol className="manual-list numbered-list">
                {productionLaunchOrder.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="empty-state">All launch tasks are complete.</p>
            )}
          </article>
        </div>
      ) : (
        <div className="manual-grid">
          {deepDiveSections.map((section) => (
            <article className="manual-section" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.summary}</p>
              <ul className="manual-list">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AuditLogsPanel({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Audit Log</h2>
        <p>Recent admin actions recorded for the current tenant.</p>
      </div>
      <div className="user-list">
        {entries.map((entry) => (
          <div className="user-row" key={entry.id}>
            <div>
              <strong>{entry.summary}</strong>
              <p>
                {entry.actorEmail || 'system'} · {entry.actionKey} · {entry.entityType}
              </p>
            </div>
            <span className="status-pill next">{new Date(entry.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PermissionMatrixPanel({
  matrix,
  currentRole
}: {
  matrix: PermissionMatrixRow[];
  currentRole: string;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Permission Matrix</h2>
        <p>Role-based capabilities for the current tenant workspace.</p>
      </div>
      <div className="permission-grid">
        <div className="permission-grid-header">
          <span>Role</span>
          {matrix[0]?.permissions.map((permission) => (
            <span key={permission.key}>{permission.label}</span>
          ))}
        </div>
        {matrix.map((row) => (
          <div className={`permission-grid-row ${row.role === currentRole ? 'active' : ''}`} key={row.role}>
            <strong>{row.label}</strong>
            {row.permissions.map((permission) => (
              <span key={permission.key} className={permission.allowed ? 'permission-yes' : 'permission-no'}>
                {permission.allowed ? 'Yes' : 'No'}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function AuthPanel({
  demoCredentials,
  onAuthenticated
}: {
  demoCredentials: DemoCredentials | null;
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = React.useState<'login' | 'accept' | 'reset'>('login');
  const [loginForm, setLoginForm] = React.useState({
    tenantSlug: demoCredentials?.tenantSlug || '',
    email: demoCredentials?.email || '',
    password: demoCredentials?.password || ''
  });
  const [acceptForm, setAcceptForm] = React.useState({
    tenantSlug: demoCredentials?.tenantSlug || '',
    invitationToken: '',
    password: ''
  });
  const [resetForm, setResetForm] = React.useState({
    tenantSlug: demoCredentials?.tenantSlug || '',
    email: demoCredentials?.email || '',
    resetToken: '',
    password: ''
  });
  const [resetTokenHint, setResetTokenHint] = React.useState('');
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!demoCredentials) return;

    setLoginForm({
      tenantSlug: demoCredentials.tenantSlug,
      email: demoCredentials.email,
      password: demoCredentials.password
    });
    setAcceptForm((current) => ({ ...current, tenantSlug: demoCredentials.tenantSlug }));
    setResetForm({
      tenantSlug: demoCredentials.tenantSlug,
      email: demoCredentials.email,
      resetToken: '',
      password: ''
    });
  }, [demoCredentials]);

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to sign in.');
      return;
    }

    onAuthenticated();
  }

  async function submitAccept(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/auth/accept-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acceptForm)
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to accept invitation.');
      return;
    }

    onAuthenticated();
  }

  async function requestReset(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: resetForm.tenantSlug,
        email: resetForm.email
      })
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to request password reset.');
      return;
    }

    setResetTokenHint(payload.resetToken || '');
    setResetForm((current) => ({ ...current, resetToken: payload.resetToken || current.resetToken }));
  }

  async function submitReset(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: resetForm.tenantSlug,
        resetToken: resetForm.resetToken,
        password: resetForm.password
      })
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(payload.error || 'Unable to reset password.');
      return;
    }

    onAuthenticated();
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Authentication</h2>
          <p>Use tenant login or accept an invitation to create a real session.</p>
        </div>
        <div className="subtabs auth-tabs" aria-label="Authentication modes">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'accept' ? 'active' : ''} onClick={() => setMode('accept')}>
            Accept invitation
          </button>
          <button className={mode === 'reset' ? 'active' : ''} onClick={() => setMode('reset')}>
            Reset password
          </button>
        </div>
        {mode === 'login' ? (
          <form className="form-grid onboarding-form" onSubmit={submitLogin}>
            <label>
              Tenant slug
              <input
                value={loginForm.tenantSlug}
                onChange={(event) => setLoginForm((current) => ({ ...current, tenantSlug: event.target.value }))}
              />
            </label>
            <label>
              Email
              <input
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="full-width">
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            {error ? <p className="error full-width">{error}</p> : null}
            <div className="form-actions full-width">
              <button type="submit" className="primary" disabled={saving}>
                <ShieldCheck size={16} />
                {saving ? 'Signing in' : 'Sign in'}
              </button>
            </div>
          </form>
        ) : mode === 'accept' ? (
          <form className="form-grid onboarding-form" onSubmit={submitAccept}>
            <label>
              Tenant slug
              <input
                value={acceptForm.tenantSlug}
                onChange={(event) => setAcceptForm((current) => ({ ...current, tenantSlug: event.target.value }))}
              />
            </label>
            <label>
              Invitation token
              <input
                value={acceptForm.invitationToken}
                onChange={(event) => setAcceptForm((current) => ({ ...current, invitationToken: event.target.value }))}
              />
            </label>
            <label className="full-width">
              New password
              <input
                type="password"
                value={acceptForm.password}
                onChange={(event) => setAcceptForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            {error ? <p className="error full-width">{error}</p> : null}
            <div className="form-actions full-width">
              <button type="submit" className="primary" disabled={saving}>
                <MailPlus size={16} />
                {saving ? 'Accepting' : 'Accept invitation'}
              </button>
            </div>
          </form>
        ) : (
          <form className="form-grid onboarding-form" onSubmit={submitReset}>
            <label>
              Tenant slug
              <input
                value={resetForm.tenantSlug}
                onChange={(event) => setResetForm((current) => ({ ...current, tenantSlug: event.target.value }))}
              />
            </label>
            <label>
              Email
              <input
                value={resetForm.email}
                onChange={(event) => setResetForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="full-width">
              Reset token
              <input
                value={resetForm.resetToken}
                onChange={(event) => setResetForm((current) => ({ ...current, resetToken: event.target.value }))}
              />
            </label>
            <label className="full-width">
              New password
              <input
                type="password"
                value={resetForm.password}
                onChange={(event) => setResetForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            {resetTokenHint ? <p className="error full-width">reset token: {resetTokenHint}</p> : null}
            {error ? <p className="error full-width">{error}</p> : null}
            <div className="form-actions full-width">
              <button type="button" onClick={requestReset} disabled={saving}>
                <MailPlus size={16} />
                {saving ? 'Working' : 'Request reset'}
              </button>
              <button type="submit" className="primary" disabled={saving}>
                <ShieldCheck size={16} />
                {saving ? 'Working' : 'Reset password'}
              </button>
            </div>
          </form>
        )}
      </article>

      <article className="panel">
        <div className="panel-heading">
          <h2>Local Demo Access</h2>
          <p>Seeded credentials for the local Postgres tenant. This includes the master admin login for development.</p>
        </div>
        {demoCredentials ? (
          <dl className="session-list">
            <div>
              <dt>Role</dt>
              <dd>Master admin / tenant owner</dd>
            </div>
            <div>
              <dt>Tenant slug</dt>
              <dd>{demoCredentials.tenantSlug}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{demoCredentials.email}</dd>
            </div>
            <div>
              <dt>Password</dt>
              <dd>{demoCredentials.password}</dd>
            </div>
          </dl>
        ) : (
          <p className="lede">Demo credentials unavailable.</p>
        )}
      </article>
    </section>
  );
}

function App() {
  const [screen, setScreen] = React.useState<
    'overview' | 'onboarding' | 'users' | 'invitations' | 'sales-groups' | 'members' | 'customers' | 'orders' | 'commissions' | 'billing' | 'audit' | 'access' | 'manual'
  >('overview');
  const [session, setSession] = React.useState<SessionPayload | null>(null);
  const [setup, setSetup] = React.useState<TenantSetup | null>(null);
  const [demoCredentials, setDemoCredentials] = React.useState<DemoCredentials | null>(null);
  const [deliveryLogs, setDeliveryLogs] = React.useState<EmailDeliveryLog[]>([]);
  const [users, setUsers] = React.useState<TenantUser[]>([]);
  const [invitations, setInvitations] = React.useState<TenantInvitation[]>([]);
  const [tenantRoles, setTenantRoles] = React.useState<string[]>([]);
  const [salesGroups, setSalesGroups] = React.useState<SalesGroup[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [commissionSummaries, setCommissionSummaries] = React.useState<CommissionSummary[]>([]);
  const [payoutBatches, setPayoutBatches] = React.useState<PayoutBatch[]>([]);
  const [payoutItems, setPayoutItems] = React.useState<PayoutItem[]>([]);
  const [commissionSnapshots, setCommissionSnapshots] = React.useState<CommissionSnapshot[]>([]);
  const [commissionPlans, setCommissionPlans] = React.useState<CommissionPlanVersion[]>([]);
  const [commissionRules, setCommissionRules] = React.useState<CommissionRule[]>([]);
  const [billingSubscription, setBillingSubscription] = React.useState<TenantSubscription | null>(null);
  const [billingInvoices, setBillingInvoices] = React.useState<BillingInvoice[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>([]);
  const [permissionMatrix, setPermissionMatrix] = React.useState<PermissionMatrixRow[]>([]);

  async function fetchSessionOnly() {
    const [sessionResponse, demoCredentialsResponse] = await Promise.all([
      fetch('/api/session'),
      fetch('/api/auth/demo-credentials')
    ]);
    const demoCredentialsPayload = await demoCredentialsResponse.json();
    setDemoCredentials(demoCredentialsPayload);

    if (!sessionResponse.ok) {
      setSession(null);
      return false;
    }

    const sessionPayload = await sessionResponse.json();
    setSession(sessionPayload);
    return true;
  }

  async function reloadAuditLogs() {
    const response = await fetch('/api/admin/audit-logs');
    const payload = await response.json();
    setAuditLogs(payload.entries);
  }

  async function reloadFinanceData() {
    const [commissionsResponse, payoutsResponse] = await Promise.all([
      fetch('/api/admin/commissions'),
      fetch('/api/admin/payouts')
    ]);
    const [commissionsPayload, payoutsPayload] = await Promise.all([
      commissionsResponse.json(),
      payoutsResponse.json()
    ]);
    setCommissionSummaries(commissionsPayload.summaries);
    setPayoutBatches(payoutsPayload.batches);
  }

  async function loadData() {
    const sessionResolved = await fetchSessionOnly();
    if (!sessionResolved) {
      setSetup(null);
      setUsers([]);
      setInvitations([]);
      setTenantRoles([]);
      setSalesGroups([]);
      setMembers([]);
      setCustomers([]);
      setProducts([]);
      setOrders([]);
      setCommissionSummaries([]);
      setPayoutBatches([]);
      setPayoutItems([]);
      setCommissionSnapshots([]);
      setCommissionPlans([]);
      setCommissionRules([]);
      setBillingSubscription(null);
      setBillingInvoices([]);
      setAuditLogs([]);
      setPermissionMatrix([]);
      setDeliveryLogs([]);
      return;
    }

    const [
      onboardingResponse,
      usersResponse,
      invitationsResponse,
      rolesResponse,
      salesGroupsResponse,
      membersResponse,
      customersResponse,
      productsResponse,
      ordersResponse,
      commissionsResponse,
      payoutsResponse,
      payoutItemsResponse,
      commissionSnapshotsResponse,
      billingResponse,
      plansResponse,
      permissionsResponse,
      auditLogsResponse,
      deliveryLogsResponse
    ] = await Promise.all([
      fetch('/api/admin/onboarding'),
      fetch('/api/admin/tenant-users'),
      fetch('/api/admin/invitations'),
      fetch('/api/tenant-roles'),
      fetch('/api/admin/sales-groups'),
      fetch('/api/admin/members'),
      fetch('/api/admin/customers'),
      fetch('/api/admin/products'),
      fetch('/api/admin/orders'),
      fetch('/api/admin/commissions'),
      fetch('/api/admin/payouts'),
      fetch('/api/admin/payout-items'),
      fetch('/api/admin/commission-snapshots'),
      fetch('/api/admin/billing'),
      fetch('/api/admin/commission-plans'),
      fetch('/api/admin/permission-matrix'),
      fetch('/api/admin/audit-logs'),
      fetch('/api/admin/email-delivery-logs')
    ]);
    const [
      onboardingPayload,
      usersPayload,
      invitationsPayload,
      rolesPayload,
      salesGroupsPayload,
      membersPayload,
      customersPayload,
      productsPayload,
      ordersPayload,
      commissionsPayload,
      payoutsPayload,
      payoutItemsPayload,
      commissionSnapshotsPayload,
      billingPayload,
      plansPayload,
      permissionsPayload,
      auditLogsPayload,
      deliveryLogsPayload
    ] = await Promise.all([
      onboardingResponse.json(),
      usersResponse.json(),
      invitationsResponse.json(),
      rolesResponse.json(),
      salesGroupsResponse.json(),
      membersResponse.json(),
      customersResponse.json(),
      productsResponse.json(),
      ordersResponse.json(),
      commissionsResponse.json(),
      payoutsResponse.json(),
      payoutItemsResponse.json(),
      commissionSnapshotsResponse.json(),
      billingResponse.json(),
      plansResponse.json(),
      permissionsResponse.json(),
      auditLogsResponse.json(),
      deliveryLogsResponse.json()
    ]);
    setSetup(onboardingPayload.setup);
    setUsers(usersPayload.users);
    setInvitations(invitationsPayload.invitations);
    setTenantRoles(rolesPayload.roles);
    setSalesGroups(salesGroupsPayload.salesGroups);
    setMembers(membersPayload.members);
    setCustomers(customersPayload.customers);
    setProducts(productsPayload.products);
    setOrders(ordersPayload.orders);
    setCommissionSummaries(commissionsPayload.summaries);
    setPayoutBatches(payoutsPayload.batches);
    setPayoutItems(payoutItemsPayload.items);
    setCommissionSnapshots(commissionSnapshotsPayload.snapshots);
    setBillingSubscription(billingPayload.subscription);
    setBillingInvoices(billingPayload.invoices);
    setCommissionPlans(plansPayload.plans);
    setCommissionRules(plansPayload.rules);
    setPermissionMatrix(permissionsPayload.matrix);
    setAuditLogs(auditLogsPayload.entries);
    setDeliveryLogs(deliveryLogsPayload.deliveries);
  }

  React.useEffect(() => {
    loadData().catch(() => {
      setSession(null);
      setSetup(null);
      setDemoCredentials(null);
    });
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await loadData();
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Phase 1 foundation</p>
          <h1>MLM Hosting SaaS</h1>
          <p className="lede">
            Multi-tenant sales, customer, commission, and payout infrastructure for `mtbn.net` hosting resellers.
          </p>
        </div>
        <section className="hero-panel" aria-label="Current milestone">
          <h2>Current Focus</h2>
          <strong>Production launch validation</strong>
          <p>Keep the tenant, finance, and access workflows aligned while the release checklist stays complete.</p>
        </section>
      </header>

      <section className="grid stats-grid">
        <article className="stat-card">
          <span>Target tenancy</span>
          <strong>Multi-tenant</strong>
        </article>
        <article className="stat-card">
          <span>Data layer</span>
          <strong>PostgreSQL</strong>
        </article>
        <article className="stat-card">
          <span>Current status</span>
          <strong>{setup?.status || 'signed out'}</strong>
        </article>
        <article className="stat-card">
          <span>Theme preset</span>
          <strong>{setup?.themePreset || 'forest'}</strong>
        </article>
      </section>

      {session ? (
        <section className="panel auth-status-panel">
          <div className="panel-heading">
            <h2>Authenticated Session</h2>
            <p>
              {session.user.firstName} {session.user.lastName} · {session.role} · {session.tenant.slug}
            </p>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => logout()}>
              <ShieldCheck size={16} />
              Sign out
            </button>
          </div>
        </section>
      ) : (
        <AuthPanel demoCredentials={demoCredentials} onAuthenticated={() => loadData().catch(() => undefined)} />
      )}

      {session ? (
      <nav className="subtabs" aria-label="Admin sections">
        <button className={screen === 'overview' ? 'active' : ''} onClick={() => setScreen('overview')}>
          <LayoutDashboard size={16} />
          Overview
        </button>
        <button className={screen === 'onboarding' ? 'active' : ''} onClick={() => setScreen('onboarding')}>
          <Settings2 size={16} />
          Onboarding
        </button>
        <button className={screen === 'users' ? 'active' : ''} onClick={() => setScreen('users')}>
          <Users size={16} />
          Users
        </button>
        <button className={screen === 'invitations' ? 'active' : ''} onClick={() => setScreen('invitations')}>
          <MailPlus size={16} />
          Invitations
        </button>
        <button className={screen === 'sales-groups' ? 'active' : ''} onClick={() => setScreen('sales-groups')}>
          <Network size={16} />
          Sales groups
        </button>
        <button className={screen === 'members' ? 'active' : ''} onClick={() => setScreen('members')}>
          <ListTree size={16} />
          Members
        </button>
        <button className={screen === 'customers' ? 'active' : ''} onClick={() => setScreen('customers')}>
          <BriefcaseBusiness size={16} />
          Customers
        </button>
        <button className={screen === 'orders' ? 'active' : ''} onClick={() => setScreen('orders')}>
          <ShoppingCart size={16} />
          Orders
        </button>
        <button className={screen === 'commissions' ? 'active' : ''} onClick={() => setScreen('commissions')}>
          <BadgeDollarSign size={16} />
          Commissions
        </button>
        <button className={screen === 'billing' ? 'active' : ''} onClick={() => setScreen('billing')}>
          <Settings2 size={16} />
          Billing
        </button>
        <button className={screen === 'audit' ? 'active' : ''} onClick={() => setScreen('audit')}>
          <ScrollText size={16} />
          Audit
        </button>
        <button className={screen === 'access' ? 'active' : ''} onClick={() => setScreen('access')}>
          <ShieldCheck size={16} />
          Access
        </button>
        <button className={screen === 'manual' ? 'active' : ''} onClick={() => setScreen('manual')}>
          <BookOpenText size={16} />
          Manual
        </button>
      </nav>
      ) : null}

      {session && screen === 'overview' ? (
        <>
          <section className="content-grid">
            <article className="panel">
              <div className="panel-heading">
                <h2>Execution Roadmap</h2>
                <p>Immediate delivery order for the SaaS build.</p>
              </div>
              <div className="milestones">
                {milestones.map((milestone) => (
                  <div className="milestone" key={milestone.title}>
                    <StatusPill status={milestone.status} />
                    <div>
                      <strong>{milestone.title}</strong>
                      <p>{milestone.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <OverviewPanel session={session} setup={setup} />
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Planned Workstreams</h2>
              <p>Major product slices that this project will grow into.</p>
            </div>
            <div className="workstreams">
              {workstreams.map(({ icon: Icon, title, text }) => (
                <article className="workstream" key={title}>
                  <Icon size={20} />
                  <strong>{title}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {session && screen === 'onboarding' ? (
        <OnboardingPanel
          setup={setup}
          onSaved={(nextSetup) => {
            setSetup(nextSetup);
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'users' ? (
        <UsersPanel
          users={users}
          tenantRoles={tenantRoles}
          onUserAdded={(user) => {
            setUsers((current) => {
              const filtered = current.filter((entry) => entry.email !== user.email);
              return [...filtered, user].sort((a, b) => a.lastName.localeCompare(b.lastName));
            });
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'invitations' ? (
        <InvitationsPanel
          invitations={invitations}
          tenantRoles={tenantRoles}
          deliveries={deliveryLogs}
          onInvitationAdded={(invitation) => {
            setInvitations((current) => {
              const filtered = current.filter((entry) => entry.id !== invitation.id);
              return [invitation, ...filtered];
            });
            reloadAuditLogs().catch(() => undefined);
          }}
          onDeliveryLogged={(delivery) => {
            setDeliveryLogs((current) => [delivery, ...current]);
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'sales-groups' ? (
        <SalesGroupsPanel
          salesGroups={salesGroups}
          onGroupAdded={(group) => {
            setSalesGroups((current) => [...current, group].sort((left, right) => left.name.localeCompare(right.name)));
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'members' ? (
        <MembersPanel
          members={members}
          salesGroups={salesGroups}
          onMemberAdded={(member) => {
            setMembers((current) => [...current, member].sort((left, right) => left.lastName.localeCompare(right.lastName)));
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'customers' ? (
        <CustomersPanel
          customers={customers}
          members={members}
          onCustomerAdded={(customer) => {
            setCustomers((current) =>
              [...current, customer].sort((left, right) => left.companyName.localeCompare(right.companyName))
            );
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'orders' ? (
        <OrdersPanel
          orders={orders}
          products={products}
          customers={customers}
          members={members}
          onOrderAdded={(order) => {
            setOrders((current) => [...current, order].sort((left, right) => right.placedAt.localeCompare(left.placedAt)));
            reloadFinanceData().catch(() => undefined);
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'commissions' ? (
        <CommissionsPanel
          summaries={commissionSummaries}
          payouts={payoutBatches}
          payoutItems={payoutItems}
          commissionSnapshots={commissionSnapshots}
          plans={commissionPlans}
          rules={commissionRules}
          auditLogs={auditLogs}
          onBatchUpdated={(batch) => {
            setPayoutBatches((current) => current.map((entry) => (entry.id === batch.id ? batch : entry)));
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'billing' && billingSubscription ? (
        <BillingPanel
          subscription={billingSubscription}
          invoices={billingInvoices}
          onSubscriptionSaved={(subscription) => {
            setBillingSubscription(subscription);
            reloadAuditLogs().catch(() => undefined);
          }}
          onInvoicePaid={(invoice) => {
            setBillingInvoices((current) => current.map((entry) => (entry.id === invoice.id ? invoice : entry)));
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {session && screen === 'audit' ? <AuditLogsPanel entries={auditLogs} /> : null}
      {session && screen === 'access' ? <PermissionMatrixPanel matrix={permissionMatrix} currentRole={session.role} /> : null}
      {session && screen === 'manual' ? <ManualPanel /> : null}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
