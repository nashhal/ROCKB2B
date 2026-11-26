# ROCK B2B — Demo V1 implementation plan

## Objective
Create one internal sales workspace for 1–5 representatives, a sales manager and finance. Demo reviewers can exercise daily workflows with synthetic records and no connection to live inventory, accounting, banking or ZATCA.

## Demo V1 scope
1. Arabic-first responsive PWA with RTL layout.
2. Role-preview workspaces: owner, sales manager, finance and representative.
3. Customer search and add-customer flow.
4. Product catalogue, manual sample product entry and XLSX / CSV import.
5. Sales order creation for field and remote channels.
6. Per-representative discount ceiling; over-limit orders wait for manager approval.
7. Clearly watermarked demo invoice register.
8. Cash receipt simulation, pending bank-transfer verification and partial payment illustration.
9. Visit / contact activity capture.
10. Team target overview and invoice CSV export.
11. Local browser persistence and reset-demo action.

## Milestones
### M0 — Repository and visual foundation
- Keep main as the stable integration branch.
- Develop on demo-v1.
- Add responsive shell, ROCK identity, RTL layout and navigation.
- Add a CI build check.

### M1 — Demo interactions
- Seed synthetic users, customers, products, orders, invoices, payments and visits.
- Add browser-local workflow interactions.
- Validate XLSX import columns and duplicate SKU behavior.
- Review layouts at mobile, tablet and desktop widths.

### M2 — API and persistent database
- Implement authentication, sessions, PostgreSQL and Prisma migrations.
- Enforce authorization in the API.
- Replace browser-local state with API data.
- Add audit events, idempotency keys and transactional invoice / payment workflows.

### M3 — Finance and e-invoicing readiness
- Confirm the institution's VAT registration, invoice types and ZATCA wave.
- Confirm whether the current inventory / accounting system already issues compliant tax invoices.
- Decide whether ROCK B2B issues through an approved provider or delegates issuance to the current system.
- Test the applicable integration before live issuance.

### M4 — Pilot and release
- Import a reviewed product-price workbook.
- Create staff accounts and discount policies.
- Test with synthetic or explicitly approved pilot records.
- Run acceptance tests and restore test backups.
- Deploy preview, review, then promote only after owner approval.

## Out of scope
Customer portal; warehouse quantities and stock movements; full general ledger; payroll; live payment gateway; real tax invoice issuance; continuous GPS tracking.

## Definition of done
- Clean production build.
- No horizontal overflow at 360, 390, 768, 1024 and desktop widths.
- Main sales and finance demo scenarios pass.
- All demo records are clearly labelled.
- No secrets or real customer data in Git.
- No production credentials in preview deployments.
- Production integrations remain disabled until configured and verified.