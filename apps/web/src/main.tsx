import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeDollarSign,
  Building2,
  LayoutDashboard,
  Palette,
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

function StatusPill({ status }: { status: StepStatus }) {
  return <span className={`status-pill ${status}`}>{status === 'done' ? 'Done' : status === 'active' ? 'In Progress' : 'Queued'}</span>;
}

function App() {
  const [session, setSession] = React.useState<SessionPayload | null>(null);

  React.useEffect(() => {
    fetch('/api/session')
      .then((response) => response.json())
      .then((payload) => setSession(payload))
      .catch(() => setSession(null));
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
          <strong>Tenant and access foundation</strong>
          <p>Start with the platform boundaries that every later sales, customer, and payout workflow depends on.</p>
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
          <span>Frontend stack</span>
          <strong>React + TypeScript</strong>
        </article>
        <article className="stat-card">
          <span>API style</span>
          <strong>Node service layer</strong>
        </article>
      </section>

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

        <article className="panel">
          <div className="panel-heading">
            <h2>Tenant Session</h2>
            <p>Current tenant-aware auth foundation from the API layer.</p>
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
                <dd>{session.user.firstName} {session.user.lastName}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{session.role}</dd>
              </div>
            </dl>
          ) : (
            <p className="lede">Session context unavailable until the API is running.</p>
          )}
        </article>
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
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
