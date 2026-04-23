# Schema Outline

## Platform

- tenants
- tenant_domains
- subscriptions

## Identity

- users
- roles
- user_tenant_roles

## Sales Organization

- sales_groups
- members
- member_relationships

Implemented in migration `0002_core_sales_entities.sql`:
- `sales_groups`
- `members` with inline `sponsor_member_id`

## CRM

- customers
- customer_activities

Implemented in migration `0002_core_sales_entities.sql`:
- `customers`

## Commerce

- products
- orders
- order_items

Implemented in migration `0002_core_sales_entities.sql`:
- `products`
- `orders`

## Compensation

- commission_plan_versions
- commission_rules
- commissions
- payout_batches
- payout_items
