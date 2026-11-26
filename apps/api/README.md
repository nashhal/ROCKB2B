# ROCK B2B API — planned service

The first review build uses browser-local synthetic data. This directory reserves the API boundary for the server-backed release.

Planned modules:
- Authentication, sessions and server-side role authorization
- Users, representatives and customer assignment
- Customers, contacts and addresses
- Product catalogue and reviewed XLSX import batches
- Price lists and discount policies
- Orders and approval workflows
- E-invoicing adapter for the institution's approved solution
- Payments, allocations and customer ledger
- Visits, activities, targets and notifications
- Audit events and reports

The API must own all financial calculations and state transitions. Never trust totals, discounts, role IDs or invoice status submitted by the browser.

Suggested implementation: NestJS + TypeScript + Prisma + PostgreSQL. Build this service after database credentials and the institution's invoice-system ownership are confirmed.