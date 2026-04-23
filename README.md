# MLM Hosting SaaS

White-labeled SaaS platform for `mtbn.net` hosting resellers to manage:

- tenants and branding
- sales groups and multilevel hierarchies
- members and customers
- hosting products and plans
- orders, commissions, payouts, and reports

## Workspace Layout

```text
apps/
  web/
  api/
  jobs/
packages/
  auth/
  commissions/
  config/
  database/
  reporting/
  ui/
docs/
infra/
```

## Current Working Scope

- tenant onboarding and white-label setup
- tenant user and role management
- sales group management
- member hierarchy with sponsor relationships
- customer ownership management
- seeded hosting product catalog
- order entry tied to members and customers
- derived commission summaries and payout batches

The current implementation is a working SaaS foundation and demo workflow running on PostgreSQL for the business domain. It is not yet a production-complete platform.

## Commands

```bash
npm install
npm run typecheck
npm run build
npm run dev:web
npm run dev:api
```

Required runtime environment:

```bash
export DATABASE_URL=postgresql://mlm:mlm_dev_password@127.0.0.1:5433/mlm_hosting_saas
```

Default local URLs:

- Web: `http://localhost:5174/`
- API: `http://127.0.0.1:4000/`

## Verified

- `npm run typecheck`
- `npm run build`
- `GET /api/health`
- `GET /api/admin/members`
- `GET /api/admin/customers`
- `GET /api/admin/orders`
- `GET /api/admin/commissions`
- the same order and commission reads through the Vite proxy
- local Postgres-backed write validation through `POST /api/admin/sales-groups`

## Next Production-Critical Work

- replace demo auth with real authentication, invitations, sessions, and password flows
- add persisted commission plans and payout approval actions
- add audit logging, billing/subscription handling, and background jobs
- add automated tests around the API workflows and commission math

## Planning

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
