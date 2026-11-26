# ROCK B2B — security boundaries

## Demo-only limitations
- The role selector is for screen review only; it is not sign-in.
- Data is stored in the current browser and can be edited through developer tools.
- No server database, secure session, access control, tax integration or bank verification exists in Demo V1.
- All invoice examples are marked DEMO — NOT A TAX INVOICE.
- Do not import real customer details, payment evidence, passwords or finance records.

## Production requirements
1. Server-side authentication with secure, httpOnly, sameSite cookies and session revocation.
2. RBAC and representative / customer data scope enforced by the API.
3. MFA for owner, manager and finance accounts where practical.
4. Password hashing with a current memory-hard algorithm such as Argon2id.
5. Rate limiting, input validation, output encoding and CSRF protection where applicable.
6. Least-privilege database credentials and parameterized database access.
7. Private storage, size / MIME / file-signature checks, and malware scanning where supported.
8. Audit events for price changes, discount decisions, invoice issue / correction and payment confirmation.
9. Database transactions and idempotency for invoice numbering and payment movements.
10. Encrypted backups and periodic restore drills.
11. Separate preview and production secrets / databases.
12. No secrets in source, browser bundles, logs, GitHub issues or screenshots.

## Location privacy
Collect location only when the representative explicitly records a field visit. Do not track staff continuously. Explain the purpose and apply the institution's retention policy.

## Invoice safety
A PDF renderer alone does not create a compliant tax invoice. Confirm taxpayer obligations and the approved software / provider path before enabling live issuance.