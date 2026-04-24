# Database Package

Owns:

- PostgreSQL schema
- migrations
- seed scripts
- tenant-aware query helpers
- connection and migration tooling

Initial tables to design first:

- tenants
- users
- roles
- memberships
- sales_groups
- members
- customers
- products
- orders
- order_items
- commission_plans
- commission_rules
- payouts

Current starter migration:

- [0001_phase1_foundation.sql](./0001_phase1_foundation.sql)
- [0002_core_sales_entities.sql](./0002_core_sales_entities.sql)
- [0003_demo_seed_data.sql](./0003_demo_seed_data.sql)
- [0004_tenant_admin_fields.sql](./0004_tenant_admin_fields.sql)
- [0005_backfill_demo_tenant_admin.sql](./0005_backfill_demo_tenant_admin.sql)
- [0006_audit_logs.sql](./0006_audit_logs.sql)

Core entity coverage now includes:

- `sales_groups`
- `members`
- `customers`
- `products`
- `orders`
- `audit_logs`

Current runtime note:

- the API now uses a dedicated repository module for these entities
- the Postgres repository now supports core reads and primary writes for the seeded demo tenant
- `STORAGE_PROVIDER=postgres` also requires a valid `DATABASE_URL`

Runtime files:

- [src/db.ts](./src/db.ts)
- [src/migrate.ts](./src/migrate.ts)

Run migrations:

```bash
npm run db:migrate
```
