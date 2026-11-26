# ROCK B2B — Copilot instructions

## Project context
- This repository is the ROCK B2B sales-management prototype.
- The current web client is a React + Vite application in `apps/web`; inspect the source before assuming the target architecture has been implemented.
- API handlers are under `api/`, shared server code under `lib/`, and the Prisma schema under `prisma/`.
- Read the relevant project documents before changing business, data, security, or deployment behavior: `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md`, `docs/ACCEPTANCE_TESTS.md`, and `docs/DATABASE_SCHEMA.md`.

## Important prototype boundary
- Treat the current demo as a prototype with synthetic data only.
- The role selector in the demo UI is a presentation control, not secure authentication or authorization.
- Browser storage is user-editable and must not be treated as a trusted source for permissions, prices, balances, receipts, or audit evidence.
- Never import, request, commit, log, or expose real customer records, payment evidence, passwords, bank details, API tokens, or production credentials.
- Demo invoices are not tax invoices. Do not claim ZATCA, accounting, bank settlement, production RBAC, multi-user synchronization, or backup compliance unless each is implemented and independently verified.
- Do not connect production inventory, accounting, banking, tax, or customer systems as part of a prototype task.

## Working rules
1. Inspect the current implementation and relevant tests before editing. Do not assume documentation or old task notes describe the current code exactly.
2. Preserve existing business rules, roles, authorization boundaries, data formats, and brand assets unless the task explicitly requires a reviewed change.
3. Keep changes focused. Avoid broad rewrites, unnecessary dependencies, hidden behavior changes, and invented APIs.
4. For UI work, use the established ROCK visual language: white/light surfaces, navy `#071a33`, blue `#1479dc`, restrained borders and shadows, Arabic RTL first, Noto Naskh Arabic for Arabic and Manrope for Latin/English text.
5. Prefer accessible semantic controls, visible keyboard focus, clear loading/empty/error states, and responsive layouts.
6. Never weaken CI checks to make a change pass. Fix the underlying cause and add regression coverage when practical.
7. Explain assumptions, limitations, changed paths, tests run, and anything not verified. Do not report a deployment as live until the deployment target, commit SHA, state, and production alias have been checked.

## Repository checks
Run these from the repository root when the change warrants them:
- `npm run check:api`
- `npm test`
- `npm run build`

The GitHub Actions workflow in `.github/workflows/ci.yml` is the source of truth for CI commands and currently uses Node.js 22.

## Skills
Load the matching skill under `.github/skills/` for UI review, React implementation, responsive testing, security review, GitHub Actions debugging, or deployment verification. Skills add task-specific procedures; they do not override the prototype and security boundaries above.
