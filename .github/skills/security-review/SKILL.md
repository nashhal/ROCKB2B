---
name: security-review
description: Review ROCK B2B security, authentication, authorization, role boundaries, API handlers, data privacy, file imports, financial operations, and prototype-to-production risks. Use before sensitive changes or when assessing production readiness.
---

# ROCK B2B security review

## Mandatory reading
Read `docs/SECURITY.md`, `docs/ARCHITECTURE.md`, and `docs/DATABASE_SCHEMA.md` before reviewing a security-sensitive feature. Inspect the actual implementation; documentation is a requirement baseline, not proof that controls exist.

## Current prototype boundary
The project documentation describes the current demo as synthetic, browser-local, and not approved for real operational data. In particular:
- Role selection is a UI preview control, not sign-in.
- Browser storage can be edited by the user and is not a trust boundary.
- Do not claim secure sessions, server-enforced RBAC, financial verification, ZATCA compliance, production backups, or multi-user synchronization unless the implementation and deployment are verified.
- Do not import or use real customer data, real payment proofs, banking records, production passwords, or live credentials for testing.
- A PDF invoice renderer does not itself create a compliant tax invoice.

## Review checklist
1. **Authentication:** inspect credential handling, password hashing, session cookies, expiry, revocation, CSRF exposure, MFA expectations, and rate limits. Never log or echo credentials.
2. **Authorization:** verify permissions on the server for every protected route and mutation. Check owner, manager, finance, and representative boundaries, including representative/customer data scope. Hiding a button is not authorization.
3. **Input and output:** validate data at trust boundaries; use parameterized database access; prevent injection, path traversal, unsafe file handling, and cross-site scripting.
4. **Secrets:** inspect environment-variable use and ensure secrets are absent from source, browser bundles, commits, issues, logs, screenshots, and error responses.
5. **Uploads and imports:** validate size, extension, MIME type and file signature where relevant; reject malformed spreadsheets; avoid unsafe filenames and public storage of private files.
6. **Financial integrity:** verify transaction boundaries, idempotency, immutable issued records, amount precision, discount approval, payment allocation, and explicit finance confirmation for transfers.
7. **Privacy:** minimize personal data, restrict access, define retention, and never add continuous staff tracking. Location may only be considered for an explicitly recorded field visit with appropriate notice and policy.
8. **Operations:** inspect database least privilege, environment separation, backup encryption, restore process, monitoring, and audit trails.

## Review method
- Trace each sensitive action from UI to API handler to data access and response.
- Identify the caller-controlled fields and verify they cannot override user identity, role, ownership, price, balance, or approval state.
- Check failure paths as well as successful paths.
- Prefer a minimal security fix with a regression test.
- Do not weaken authentication, authorization, validation, logging redaction, or CI to make a flow appear functional.

## Findings
Classify each finding as Critical, High, Medium, or Low. Include:
- affected file/route and relevant operation;
- realistic impact and required attacker capability;
- evidence in the code;
- recommended mitigation;
- test needed to prevent recurrence.

Separate confirmed vulnerabilities from missing production controls and design recommendations. Never claim the app is secure or production-ready based only on a source scan or passing tests.
