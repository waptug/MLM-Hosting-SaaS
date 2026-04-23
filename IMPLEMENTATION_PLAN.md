# MLM Hosting SaaS Implementation Plan

## Goal

Build a fully white-labeled SaaS platform for independent web hosting resellers of `mtbn.net` to:

- create and manage sales organizations
- build multilevel sales groups
- manage members, customers, products, and hosting plans
- track orders, sales, commissions, and payouts
- configure tenant branding and reseller-specific rules
- operate as a multi-tenant commercial platform

This plan assumes the current `MLM-Simulator` app is a working prototype and reference implementation, not the final production architecture.

## Product Vision

The SaaS should support three layers:

1. Platform owner:
   `mtbn.net` or central operator managing the overall service
2. Reseller tenant:
   an independent hosting reseller running their own branded sales program
3. Tenant users:
   owners, managers, recruiters, and sales reps inside that reseller organization

Each tenant needs isolated data, configurable branding, configurable compensation plans, and operational reporting.

## Recommended Target Architecture

### Frontend

- React
- TypeScript
- component library or internal design system
- tenant-aware theming and branding

### Backend

- Node.js service layer
- REST or GraphQL API
- background job processor for payouts, notifications, imports, and scheduled reports

### Database

- PostgreSQL

Reason:
- safer for multi-user concurrency
- better for reporting and relational integrity
- better fit for multi-tenant SaaS than SQLite

### Infrastructure

- containerized deployment
- managed PostgreSQL
- object storage for assets and exports
- queue or background job system
- email delivery provider
- monitoring and audit logging

## Core Domain Model

The first major design task is stabilizing the domain.

### Platform-Level

- `platform_accounts`
- `tenants`
- `tenant_domains`
- `subscriptions`
- `billing_accounts`

### Tenant-Level

- `users`
- `roles`
- `sales_groups`
- `members`
- `customers`
- `products`
- `orders`
- `order_items`
- `commissions`
- `commission_rules`
- `commission_plan_versions`
- `payout_batches`
- `payout_items`
- `audit_logs`
- `branding_settings`

### Relationship Model

- tenant owns all tenant data
- members belong to a sales group
- members can sponsor other members
- customers belong to a member or account owner
- orders may be linked to both member and customer
- commission records are generated from orders under a specific plan version

## Delivery Phases

## Phase 0: Discovery and Rules Definition

### Objectives

- confirm the exact reseller workflow
- define what is configurable per tenant
- define commission behavior
- define payout process
- define roles and permissions

### Deliverables

- product requirements document
- domain glossary
- commission rules matrix
- tenant configuration matrix
- initial wireframes

### Key Questions

- Are sales groups flat per tenant or multiple per tenant?
- Do hosting products have recurring commissions?
- Are commissions only direct, or multi-level by depth?
- Are payouts manual approval, automated, or hybrid?
- Does each tenant manage its own subdomain or custom domain?

## Phase 1: Multi-Tenant Foundation

### Objectives

- move from prototype to SaaS-ready foundation
- establish tenant isolation
- establish auth and permissions

### Implementation

- create new backend and frontend apps for SaaS architecture
- use PostgreSQL from day one
- implement:
  - tenants
  - users
  - auth
  - roles
  - tenant scoping
  - audit logging

### Deliverables

- login and session management
- tenant onboarding flow
- role-based access control
- tenant-aware API middleware

### Exit Criteria

- users can only access their own tenant data
- tenant owner can invite users
- all records are tenant scoped

## Phase 2: Sales Organization and CRM

### Objectives

- recreate and improve the current simulator features in SaaS form

### Implementation

- member management
- sponsor/downline relationships
- customer management
- follow-up tracking
- notes and contact logs
- sales group dashboards

### Deliverables

- downline hierarchy views
- member detail pages
- customer pipeline and follow-up lists
- tenant dashboard

### Exit Criteria

- tenants can build and operate a full sales organization
- managers can review members, customers, and activity

## Phase 3: Product Catalog and Order System

### Objectives

- replace simple sales entries with a proper order model

### Implementation

- product catalog
- hosting plan catalog
- add-ons and bundles
- order entry
- order status lifecycle
- recurring billing references if needed
- refunds and returns
- inventory only where relevant

### Deliverables

- products and plans management
- orders and invoices screens
- customer purchase history
- revenue reports

### Exit Criteria

- sales and commissions are generated from normalized orders, not freeform entries

## Phase 4: Commission Engine

### Objectives

- make compensation rules configurable and versioned

### Implementation

- direct commission rules
- multi-level commission rules
- depth limits
- rank-based overrides
- qualification rules
- bonus logic
- plan versioning
- commission recompute tools

### Deliverables

- commission plan builder
- commission ledger
- payout preview reports
- exception handling and recalculation tools

### Exit Criteria

- tenants can define commission plans without code changes
- historical payouts remain tied to the rule version active at calculation time

## Phase 5: Payout Management

### Objectives

- support real commission payout operations

### Implementation

- payout batches
- approval workflow
- payout status tracking
- exported payout files
- payout history
- adjustments and clawbacks

### Deliverables

- monthly payout run tools
- manager approval screens
- reseller payout reports

### Exit Criteria

- tenant owners can review, approve, and export payout batches safely

## Phase 6: White-Label and Reseller Controls

### Objectives

- make the product commercially usable for resellers

### Implementation

- logos, colors, brand copy
- branded login pages
- branded emails
- subdomain/custom domain support
- configurable onboarding screens
- tenant-level plan defaults

### Deliverables

- branding admin area
- tenant domain mapping
- email template system

### Exit Criteria

- each reseller can present the platform as their own service

## Phase 7: Billing, Support, and Operations

### Objectives

- make the platform sellable and maintainable

### Implementation

- platform billing and subscription plans
- usage limits
- tenant provisioning automation
- support tools
- admin impersonation
- backups
- monitoring
- incident logging

### Deliverables

- billing integration
- internal admin console
- observability dashboards
- tenant lifecycle management

### Exit Criteria

- new tenants can be provisioned, billed, supported, and monitored reliably

## Technical Migration Strategy

The current simulator should be used as input, not extended into production SaaS directly.

### Keep from Current Prototype

- core UX ideas
- member hierarchy patterns
- customer and sales management concepts
- inventory and commission reporting ideas

### Replace for SaaS

- SQLite with PostgreSQL
- single-tenant schema with multi-tenant schema
- ad hoc frontend state with service-based architecture
- direct commission math in route handlers with dedicated commission services

## Initial Repository Structure Suggestion

```text
MLM-Hosting-SaaS/
  apps/
    web/
    api/
    jobs/
  packages/
    ui/
    config/
    database/
    auth/
    commissions/
    reporting/
  docs/
    requirements/
    architecture/
    workflows/
  infra/
```

## First 30-Day Build Plan

### Week 1

- finalize requirements
- design tenant and user model
- choose stack and repo structure
- design PostgreSQL schema v1

### Week 2

- scaffold frontend and backend
- implement auth
- implement tenants and roles
- build base database migrations

### Week 3

- implement members, sponsors, and customers
- implement sales groups
- build tenant dashboard

### Week 4

- implement products and orders
- implement basic commission ledger
- produce admin and tenant wireframes for payout workflows

## First Build Priorities

If building now, the correct immediate order is:

1. Create new SaaS repo structure
2. Set up PostgreSQL and migrations
3. Implement tenant, user, and auth model
4. Port members and customers into tenant-scoped schema
5. Implement order model
6. Implement versioned commission engine
7. Add white-label branding controls

## Risks to Manage Early

- commission logic becoming hardcoded and unmaintainable
- mixing platform admin and tenant admin concerns
- weak tenant isolation
- trying to keep SQLite too long
- building payout workflows without auditability
- allowing branding without domain/email strategy

## Success Criteria

The SaaS is ready for pilot use when:

- a reseller can onboard as a tenant
- tenant owner can brand their workspace
- tenant can create users and sales groups
- tenant can manage members and customers
- orders generate commissions correctly
- payout batches can be reviewed and exported
- tenant data is fully isolated
- platform admin can support tenants safely

## Recommended Next Step

Create the actual SaaS project skeleton with:

- React + TypeScript frontend
- Node API
- PostgreSQL migrations
- tenant/user/auth foundation
- docs for domain model and commission rules
