# System Overview

## Apps

- `apps/web`: tenant-facing frontend
- `apps/api`: core API
- `apps/jobs`: background processing

## Shared Packages

- `packages/database`: schema and data access
- `packages/auth`: auth and RBAC
- `packages/commissions`: compensation engine
- `packages/reporting`: reporting services
- `packages/ui`: shared frontend components

## Deployment Direction

- web app
- API app
- job worker
- PostgreSQL
- object storage
- email provider

