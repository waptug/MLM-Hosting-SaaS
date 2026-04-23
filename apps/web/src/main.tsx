import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeDollarSign,
  Building2,
  LayoutDashboard,
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

function App() {
  const [screen, setScreen] = React.useState<'overview' | 'onboarding'>('overview');
  const [session, setSession] = React.useState<SessionPayload | null>(null);
  const [setup, setSetup] = React.useState<TenantSetup | null>(null);

  async function loadData() {
    const [sessionResponse, onboardingResponse] = await Promise.all([
      fetch('/api/session'),
      fetch('/api/admin/onboarding')
    ]);
    const [sessionPayload, onboardingPayload] = await Promise.all([
      sessionResponse.json(),
      onboardingResponse.json()
    ]);
    setSession(sessionPayload);
    setSetup(onboardingPayload.setup);
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
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
