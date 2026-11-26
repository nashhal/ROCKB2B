# ROCK B2B — target PostgreSQL data model

The current review UI uses localStorage only. This is the target relational model for the API-backed release. Store money as DECIMAL / Prisma Decimal, never FLOAT. UUID primary keys are recommended.

## Identity and access
- roles: id, key, display_name
- permissions: id, key, description
- role_permissions: role_id, permission_id, unique pair
- users: id, full_name, phone, email, password_hash, role_id, status, created_at, updated_at
- representative_profiles: user_id, rep_code, discount_policy_id, active_from, active_to
- user_sessions: id, user_id, device_id, expires_at, revoked_at

## Customers
- customers: id, customer_code, legal_name, display_name, type, vat_number, assigned_rep_id, credit_limit, payment_terms_days, status
- customer_contacts: id, customer_id, contact_name, phone, email, job_title, is_primary
- customer_addresses: id, customer_id, label, city, address_text, latitude, longitude

## Products and imports
- products: id, SKU unique, name, category_id, unit_id, vat_category, vat_rate, is_active
- price_lists: id, name, currency, valid_from, valid_to, status
- price_list_items: id, price_list_id, product_id, unit_price, unique(price_list_id, product_id)
- import_batches: id, filename, checksum, uploaded_by, status, created_at, approved_by, approved_at
- import_rows: id, batch_id, row_number, external_sku, normalized_payload JSONB, validation_errors JSONB, action, product_id

Import rules: match by SKU; preview additions, updates and deactivations; require approval; never import stock quantities. Retain source files according to policy.

## Orders and discounts
- discount_policies: id, representative_id nullable, max_percent, valid_from, valid_to, is_active
- sales_orders: id, order_number unique, customer_id, representative_id, sales_channel, status, payment_terms, subtotal, discount_total, taxable_amount, tax_total, grand_total, created_at, submitted_at, approved_at
- sales_order_items: id, order_id, product_id, SKU_snapshot, name_snapshot, unit_snapshot, quantity, unit_price, discount_percent, discount_amount, tax_category, tax_rate, line_total
- discount_approval_requests: id, order_id, requested_by, requested_percent, reason, status, decided_by, decided_at

## Invoices
- invoices: id, invoice_number unique, order_id, customer_id, issued_by, invoice_type, issue_date, supply_date, currency, subtotal, discount_total, taxable_amount, tax_total, grand_total, status, compliance_provider, external_uuid, clearance_or_reporting_status
- invoice_items: id, invoice_id, SKU_snapshot, product_name_snapshot, quantity, unit_price, discount_amount, tax_category, tax_rate, line_total
- invoice_sequences: id, legal_entity_id, series_key, next_number, unique(legal_entity_id, series_key)
- invoice_events: id, invoice_id, event_type, actor_id, external_reference, request_hash, response_code, occurred_at
- credit_debit_notes: id, note_number unique, original_invoice_id, note_type, reason, taxable_amount, tax_total, grand_total, status

## Payments and receivables
- payments: id, receipt_number unique, customer_id, received_by, amount, method, status, bank_reference, evidence_document_id, received_at, confirmed_by, confirmed_at
- payment_allocations: id, payment_id, invoice_id, allocated_amount, unique(payment_id, invoice_id)
- ledger_entries: id, customer_id, entry_type, debit, credit, source_type, source_id, effective_at, created_by; immutable after posting, with reversing entries for corrections.

## Activities and controls
- visits: id, customer_id, representative_id, channel, started_at, ended_at, result, notes, latitude, longitude
- targets: id, representative_id, period_start, period_end, target_amount
- notifications: id, user_id, title, body, read_at, created_at
- documents: id, owner_type, owner_id, storage_key, content_type, size_bytes, checksum, uploaded_by
- audit_logs: id, actor_id, action, entity_type, entity_id, before_data JSONB, after_data JSONB, created_at
- idempotency_keys: id, scope, idempotency_key unique, request_hash, response_status, response_body JSONB

## Required constraints
- Unique SKU, customer code, invoice number per legal entity and series.
- Positive quantities and non-negative monetary amounts.
- Payment allocations cannot exceed confirmed payment amount or invoice balance.
- Credit limit and overdue rules are evaluated server-side in a transaction.
- Issued invoice records are immutable; corrections use the legal credit / debit note or cancellation flow.
- Representative assignment and role checks run in the API on every request.
- Index foreign keys, dates, statuses and frequently searched columns.