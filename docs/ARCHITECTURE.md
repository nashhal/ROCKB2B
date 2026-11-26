# ROCK B2B — architecture

## Current demo
The first review build is a Vite + React single-page PWA. It uses synthetic seed records and browser localStorage so the user can exercise the UI without a server. Role selection is a demonstration control, not authentication. Browser data is local to one browser profile and is editable by the user.

## Target production architecture
- Web client: React + TypeScript PWA.
- API: NestJS + TypeScript REST API.
- Database: PostgreSQL with Prisma migrations.
- File storage: private object storage with short-lived signed links.
- Hosting: Vercel for the web app and compatible API routes, or a managed Node host for the API; PostgreSQL hosted separately.
- Monitoring: structured server logs, error monitoring and audit records.

## Business boundaries
- ROCK B2B owns customer assignments, selling workflow, orders, discount approvals, invoice views, staff-entered receipts and receivables reporting.
- The existing inventory system remains the source of truth for stock quantities and warehouse operations.
- Excel import is a reviewed catalogue / price snapshot process. An authenticated vendor API can replace it later if available.
- Bank transfers remain pending until finance verifies them. An uploaded receipt alone is not proof of settlement.
- Credit is a payment term, not a receipt. Receipts are separate events allocated to invoices.

## Invoice issuance boundary
The demo invoice is not a tax invoice. Before production issuance, confirm the legal entity, VAT registration, invoice types, ZATCA onboarding and applicable phase / wave. Also determine whether the existing inventory or accounting solution already issues compliant invoices. Avoid two independent invoice-number sequences for one legal entity.

## Transaction boundaries
Invoice issue, invoice number allocation, payment confirmation and payment allocation must be database transactions. Enforce unique invoice numbers and idempotency keys. Store money in fixed-precision decimal columns. Snapshot product name, SKU, unit price, discount and tax information on every issued invoice line.

## Deploy topology
- Preview branch: demo-v1, synthetic data only.
- Production branch: main, protected and not deployed until a production-readiness review.
- Separate demo and production databases.
- Private file storage with access controls and retention rules.