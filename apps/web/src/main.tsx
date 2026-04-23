import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeDollarSign,
  Building2,
  MailPlus,
  LayoutDashboard,
  ListTree,
  Network,
  Palette,
  Settings2,
  ShieldCheck,
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

function App() {
  const [screen, setScreen] = React.useState<'overview' | 'onboarding' | 'users' | 'sales-groups' | 'members'>('overview');
  const [session, setSession] = React.useState<SessionPayload | null>(null);
  const [setup, setSetup] = React.useState<TenantSetup | null>(null);
  const [users, setUsers] = React.useState<TenantUser[]>([]);
  const [tenantRoles, setTenantRoles] = React.useState<string[]>([]);
  const [salesGroups, setSalesGroups] = React.useState<SalesGroup[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);

  async function loadData() {
    const [sessionResponse, onboardingResponse, usersResponse, rolesResponse, salesGroupsResponse, membersResponse] = await Promise.all([
      fetch('/api/session'),
      fetch('/api/admin/onboarding'),
      fetch('/api/admin/tenant-users'),
      fetch('/api/tenant-roles'),
      fetch('/api/admin/sales-groups'),
      fetch('/api/admin/members')
    ]);
    const [sessionPayload, onboardingPayload, usersPayload, rolesPayload, salesGroupsPayload, membersPayload] = await Promise.all([
      sessionResponse.json(),
      onboardingResponse.json(),
      usersResponse.json(),
      rolesResponse.json(),
      salesGroupsResponse.json(),
      membersResponse.json()
    ]);
    setSession(sessionPayload);
    setSetup(onboardingPayload.setup);
    setUsers(usersPayload.users);
    setTenantRoles(rolesPayload.roles);
    setSalesGroups(salesGroupsPayload.salesGroups);
    setMembers(membersPayload.members);
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
        <button className={screen === 'sales-groups' ? 'active' : ''} onClick={() => setScreen('sales-groups')}>
          <Network size={16} />
          Sales groups
        </button>
        <button className={screen === 'members' ? 'active' : ''} onClick={() => setScreen('members')}>
          <ListTree size={16} />
          Members
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

      {screen === 'onboarding' ? <OnboardingPanel setup={setup} onSaved={setSetup} /> : null}
      {screen === 'users' ? (
        <UsersPanel
          users={users}
          tenantRoles={tenantRoles}
          onUserAdded={(user) => {
            setUsers((current) => {
              const filtered = current.filter((entry) => entry.email !== user.email);
              return [...filtered, user].sort((a, b) => a.lastName.localeCompare(b.lastName));
            });
          }}
        />
      ) : null}
      {screen === 'sales-groups' ? (
        <SalesGroupsPanel
          salesGroups={salesGroups}
          onGroupAdded={(group) => {
            setSalesGroups((current) => [...current, group].sort((left, right) => left.name.localeCompare(right.name)));
          }}
        />
      ) : null}
      {screen === 'members' ? (
        <MembersPanel
          members={members}
          salesGroups={salesGroups}
          onMemberAdded={(member) => {
            setMembers((current) => [...current, member].sort((left, right) => left.lastName.localeCompare(right.lastName)));
          }}
        />
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
