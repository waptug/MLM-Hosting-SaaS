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

The current implementation is a working SaaS foundation and demo workflow. It is not yet a production-complete platform. The API is still using in-memory demo state for the business entities while the PostgreSQL package and migration tooling are being staged.

## Commands

```bash
npm install
npm run typecheck
npm run build
npm run dev:web
npm run dev:api
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

## Next Production-Critical Work

- move tenant, user, member, customer, product, and order state fully into PostgreSQL
- replace demo auth with real authentication, invitations, sessions, and password flows
- add persisted commission plans and payout approval actions
- add audit logging, billing/subscription handling, and background jobs
- add automated tests around the API workflows and commission math

## Planning

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
