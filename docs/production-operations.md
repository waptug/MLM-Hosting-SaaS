# Production Operations

## Secrets And Environment Management

- Keep `DATABASE_URL`, `SESSION_SECRET`, and `TRUSTED_ORIGINS` out of source control.
- Set `SESSION_COOKIE_SECURE=true` and a production `SESSION_COOKIE_DOMAIN` for real deployments.
- Use separate environment files or secret stores for local, staging, and production.

## Backup And Restore

- Back up the PostgreSQL volume or database nightly.
- Verify restores in staging before promoting a backup process to production.
- Keep at least one point-in-time restore path for finance and commission history tables.

## Retention And Privacy

- Retain audit logs, commission snapshots, and payout history long enough for accounting review.
- Remove or redact expired invitation and password-reset delivery records according to policy.
- Treat tenant-scoped data as isolated workspace data and avoid cross-tenant exports.

## Deployment Checklist

- Migrate the database before starting the API.
- Verify `/api/health` and `/api/health/ready`.
- Confirm the web origin list matches the deployed hostnames.
