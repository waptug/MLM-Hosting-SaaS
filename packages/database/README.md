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

Runtime files:

- [src/db.ts](./src/db.ts)
- [src/migrate.ts](./src/migrate.ts)

Run migrations:

```bash
npm run db:migrate
```
