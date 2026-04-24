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

The current implementation is a working SaaS foundation and demo workflow running on PostgreSQL for the business domain, tenant setup, and tenant user management. It is not yet a production-complete platform.

## Commands

```bash
npm install
npm run typecheck
npm run build
npm run dev:web
npm run dev:api
npm run start:api
npm run test:api
```

Required runtime environment:

```bash
export DATABASE_URL=postgresql://mlm:mlm_dev_password@127.0.0.1:5433/mlm_hosting_saas
export TRUSTED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
```

Default local URLs:

- Web: `http://localhost:5174/`
- API: `http://127.0.0.1:4000/`

Built API startup:

```bash
DATABASE_URL=postgresql://mlm:mlm_dev_password@127.0.0.1:5433/mlm_hosting_saas npm run start:api
```

API integration run against the active local API:

```bash
DATABASE_URL=postgresql://mlm:mlm_dev_password@127.0.0.1:5433/mlm_hosting_saas npm run test:api
```

`npm run test:api` builds the database and API packages, then runs in-process integration checks against the Express app with the local Postgres database.

## WSL Deployment To A Remote Server

Copy the deploy template and set your SSH details:

```bash
cp .deploy.env.example .deploy.env
```

If you are using password-based SSH for the server, set `DEPLOY_SSH_PASSWORD` in `.deploy.env`. If you are using an SSH key, leave it empty.
Wrap the password in quotes if it contains shell characters such as `#`.

Then run a one-shot deploy:

```bash
npm run deploy
```

Or keep the server updated while you work locally:

```bash
npm run deploy:watch
```

The deploy flow:

- builds the workspace
- stages a pruned release bundle in `.deploy/`
- auto-commits local changes if present
- pushes to GitHub
- rsyncs the staged release bundle to your server
- rsyncs the built web artifact to the public web root, defaulting to `/home/geekzoneai/www`

Set `DEPLOY_REMOTE_POST_SYNC` in `.deploy.env` if the server should run a post-sync command, such as a restart or migration step.
If you leave `DEPLOY_REMOTE_POST_SYNC` empty, the script will run a default post-sync command only when `DEPLOY_REMOTE_DB_URL` and `DEPLOY_REMOTE_SESSION_SECRET` are set. Otherwise it will skip the remote post-sync step.
If you want the script to assemble the remote Postgres URL for you, set `DEPLOY_REMOTE_DB_HOST`, `DEPLOY_REMOTE_DB_PORT`, `DEPLOY_REMOTE_DB_NAME`, `DEPLOY_REMOTE_DB_USER`, and `DEPLOY_REMOTE_DB_PASSWORD`.

## Deployment Layout

The `infra/` folder contains a local container layout for production-style runs:

- `infra/compose.yml`
- `infra/compose.staging.yml`
- `infra/api.Dockerfile`
- `infra/web.Dockerfile`
- `infra/nginx.conf`

The compose file runs PostgreSQL, the API, and the web app with the web server proxying `/api` to the API container.

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
- Postgres-backed onboarding and tenant-user reads through both direct API and Vite proxy
- automated Postgres-backed API integration run through `npm run test:api`

## Next Production-Critical Work

- replace demo auth with real authentication, invitations, sessions, and password flows
- add persisted commission plans and payout approval actions
- add audit logging, billing/subscription handling, and background jobs
- expand automated coverage around the API workflows and commission math

## Planning

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## Operations

See [docs/production-operations.md](./docs/production-operations.md) for deployment, backup, retention, and environment guidance.
