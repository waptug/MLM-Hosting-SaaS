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

## Phase 1 Scope

- multi-tenant foundation
- PostgreSQL-backed data model
- auth and roles
- tenant-aware API
- initial web shell for tenant dashboard

## Commands

```bash
npm install
npm run lint
npm run dev:web
npm run dev:api
```

## Planning

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

