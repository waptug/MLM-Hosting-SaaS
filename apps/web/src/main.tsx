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
};

type TenantUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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

type PayoutBatch = {
  id: string;
  periodLabel: string;
  scheduledFor: string;
  status: 'draft' | 'approved' | 'paid';
  payeeCount: number;
  totalAmount: number;
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

type ManualSection = {
  title: string;
  summary: string;
  items: string[];
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
  primaryDomain: ''
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
      'Draft payout batches represent a payable period snapshot and are intended for finance review.',
      'Paid batches are historical references only in the current build; payout approval actions are still planned.'
    ]
  },
  {
    title: '6. Recommended Operating Workflow',
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
    title: '7. Current Build Limits',
    summary: 'These notes matter for operating the current version correctly.',
    items: [
      'Tenant onboarding, tenant users, and the business domain are PostgreSQL-backed for the demo tenant.',
      'Authentication, password setup, billing, and payout approvals are still pending production work.',
      'Audit logging now captures key admin create actions and setup updates.',
      'For the current local environment, the app expects DATABASE_URL to point at the Postgres container.'
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

  React.useEffect(() => {
    if (tenantRoles.length && !tenantRoles.includes(form.role)) {
      setForm((current) => ({ ...current, role: tenantRoles[0] }));
    }
  }, [tenantRoles, form.role]);

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
        <div className="user-list">
          {users.map((user) => (
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
  onInvitationAdded
}: {
  invitations: TenantInvitation[];
  tenantRoles: string[];
  onInvitationAdded: (invitation: TenantInvitation) => void;
}) {
  const [form, setForm] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    role: tenantRoles[0] || 'sales_rep'
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (tenantRoles.length && !tenantRoles.includes(form.role)) {
      setForm((current) => ({ ...current, role: tenantRoles[0] }));
    }
  }, [tenantRoles, form.role]);

  function setField(field: 'email' | 'firstName' | 'lastName' | 'role', value: string) {
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
      role: tenantRoles[0] || 'sales_rep'
    });
  }

  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-heading">
          <h2>Pending Invitations</h2>
          <p>Invite future tenant users before they have active accounts.</p>
        </div>
        <div className="user-list">
          {invitations.map((invitation) => (
            <div className="user-row" key={invitation.id}>
              <div>
                <strong>
                  {invitation.firstName} {invitation.lastName}
                </strong>
                <p>
                  {invitation.email} · {invitation.role} · invited by {invitation.invitedByEmail || 'system'}
                </p>
              </div>
              <span className={`status-pill ${invitation.status === 'accepted' ? 'done' : invitation.status === 'revoked' ? 'active' : 'next'}`}>
                {invitation.status}
              </span>
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
        <div className="user-list">
          {salesGroups.map((group) => (
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

  React.useEffect(() => {
    if (salesGroups.length && !form.salesGroupId) {
      setForm((current) => ({ ...current, salesGroupId: salesGroups[0].id }));
    }
  }, [salesGroups, form.salesGroupId]);

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
        <div className="user-list">
          {members.map((member) => (
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
        <div className="user-list">
          {customers.map((customer) => (
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
        <div className="user-list">
          {orders.map((order) => (
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
  payouts
}: {
  summaries: CommissionSummary[];
  payouts: PayoutBatch[];
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
            <p>Direct commissions come from the sold product rate. Sponsor overrides are calculated at 5% of active downline orders.</p>
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
          <div className="user-list">
            {payouts.map((batch) => (
              <div className="user-row" key={batch.id}>
                <div>
                  <strong>{batch.periodLabel}</strong>
                  <p>
                    {batch.payeeCount} payees · scheduled {batch.scheduledFor}
                  </p>
                </div>
                <span className={`status-pill ${batch.status === 'paid' ? 'done' : batch.status === 'approved' ? 'active' : 'next'}`}>
                  ${batch.totalAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function ManualPanel() {
  return (
    <section className="panel manual-panel">
      <div className="panel-heading">
        <h2>User Manual</h2>
        <p>Operational guide for tenant admins, recruiters, sales managers, and finance users.</p>
      </div>
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

function App() {
  const [screen, setScreen] = React.useState<'overview' | 'onboarding' | 'users' | 'invitations' | 'sales-groups' | 'members' | 'customers' | 'orders' | 'commissions' | 'audit' | 'manual'>('overview');
  const [session, setSession] = React.useState<SessionPayload | null>(null);
  const [setup, setSetup] = React.useState<TenantSetup | null>(null);
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
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>([]);

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
    const [
      sessionResponse,
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
      auditLogsResponse
    ] = await Promise.all([
      fetch('/api/session'),
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
      fetch('/api/admin/audit-logs')
    ]);
    const [
      sessionPayload,
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
      auditLogsPayload
    ] = await Promise.all([
      sessionResponse.json(),
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
      auditLogsResponse.json()
    ]);
    setSession(sessionPayload);
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
    setAuditLogs(auditLogsPayload.entries);
  }

  React.useEffect(() => {
    loadData().catch(() => {
      setSession(null);
      setSetup(null);
    });
  }, []);

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
          <strong>Tenant onboarding and access control</strong>
          <p>Move from static foundation into actual tenant admin workflows and protected setup management.</p>
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
          <strong>{setup?.status || 'draft'}</strong>
        </article>
        <article className="stat-card">
          <span>Theme preset</span>
          <strong>{setup?.themePreset || 'forest'}</strong>
        </article>
      </section>

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
        <button className={screen === 'audit' ? 'active' : ''} onClick={() => setScreen('audit')}>
          <ScrollText size={16} />
          Audit
        </button>
        <button className={screen === 'manual' ? 'active' : ''} onClick={() => setScreen('manual')}>
          <BookOpenText size={16} />
          Manual
        </button>
      </nav>

      {screen === 'overview' ? (
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

      {screen === 'onboarding' ? (
        <OnboardingPanel
          setup={setup}
          onSaved={(nextSetup) => {
            setSetup(nextSetup);
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {screen === 'users' ? (
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
      {screen === 'invitations' ? (
        <InvitationsPanel
          invitations={invitations}
          tenantRoles={tenantRoles}
          onInvitationAdded={(invitation) => {
            setInvitations((current) => [invitation, ...current]);
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {screen === 'sales-groups' ? (
        <SalesGroupsPanel
          salesGroups={salesGroups}
          onGroupAdded={(group) => {
            setSalesGroups((current) => [...current, group].sort((left, right) => left.name.localeCompare(right.name)));
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {screen === 'members' ? (
        <MembersPanel
          members={members}
          salesGroups={salesGroups}
          onMemberAdded={(member) => {
            setMembers((current) => [...current, member].sort((left, right) => left.lastName.localeCompare(right.lastName)));
            reloadAuditLogs().catch(() => undefined);
          }}
        />
      ) : null}
      {screen === 'customers' ? (
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
      {screen === 'orders' ? (
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
      {screen === 'commissions' ? (
        <CommissionsPanel summaries={commissionSummaries} payouts={payoutBatches} />
      ) : null}
      {screen === 'audit' ? <AuditLogsPanel entries={auditLogs} /> : null}
      {screen === 'manual' ? <ManualPanel /> : null}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
