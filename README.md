# ROCK B2B

Internal B2B sales management platform for the ROCK business.

> **Prototype notice:** this repository starts as a demo workspace. Sample customers, products, invoices, payments and role switching are demonstration data only. Do not use it for real sales, tax invoices, banking records, or customer personal data.

## Product scope

ROCK B2B provides three staff workspaces:

- **Sales representative:** customers, visits, quotations/orders, discounts within assigned limits, invoice preview, and payment collection records.
- **Sales management:** representatives, customer assignments, pricing, discount approvals, order oversight, targets and sales reports.
- **Finance:** invoice register, payment verification, partial allocations, receivables and audit reports.

Initial constraints:

- 1–5 representatives.
- Arabic-first, RTL interface; English can be added later.
- Product and price catalog imported from the existing inventory system via reviewed Excel uploads.
- Inventory quantities and warehouse operations remain in the external inventory system.
- Payment terms: cash, bank transfer and credit; partial settlement is supported.
- Customer portal is out of scope for V1.
- Representative may issue a business invoice only through the institution's authorised, compliant e-invoicing process. The demo invoice is clearly marked **DEMO — NOT A TAX INVOICE**.

## ROCK Intelligence

ROCK BUSINESS includes five role-scoped specialist assistants:

- **Economic and financial analyst:** explains invoice totals, allocated payments, outstanding balances and recorded collection patterns. It does not infer profit or cash flow without cost and bank data.
- **Legal and compliance researcher:** searches Saudi official sources for relevant regulatory information. It is not a law firm and does not provide a final legal opinion.
- **Marketing and social media strategist:** drafts brand campaigns, post plans and content ideas for review.
- **Sales and account growth specialist:** helps prioritize follow-ups and prepare customer conversations within assigned sales and discount policies.
- **Management and operations advisor:** identifies process bottlenecks and proposes accountable next steps.

The agents use the Vercel AI Gateway Responses API. Legal research is restricted to configured Saudi official domains. Data passed to each agent is role-scoped; representative sessions receive only the representative's assigned customer, order, invoice, payment and visit context. The agents are advisory only: they cannot edit the workspace, approve payments, issue tax invoices, send customer messages or publish social content. A responsible employee must review and approve consequential decisions.

AI Gateway access must be configured in Vercel using the deployment's OIDC integration or an encrypted `AI_GATEWAY_API_KEY` environment variable. The default model can be changed with `ROCK_AI_MODEL`. Model requests can incur usage charges under the team's AI Gateway plan.

## Planned architecture

- Web application: React + TypeScript, responsive PWA.
- API: Node.js + TypeScript.
- Database: PostgreSQL.
- ORM and migrations: Prisma.
- File storage: private object storage for import files, invoice documents and payment evidence.
- Hosting: GitHub for source control; Vercel or another supported host for the web app/API; managed PostgreSQL for persistent data.

## Repository layout

```text
apps/
  web/                  # PWA: representative, sales management and finance workspaces
  api/                  # API service and domain rules
packages/
  shared/               # Shared types, validation schemas and constants
  config/               # Shared TypeScript / lint configuration
prisma/
  schema.prisma         # Database model
  migrations/           # Versioned database changes
docs/
  PROJECT_PLAN.md
  ARCHITECTURE.md
  DATABASE_SCHEMA.md
  SECURITY.md
  DEPLOYMENT.md
  ACCEPTANCE_TESTS.md
  DECISIONS.md
.github/
  workflows/            # CI checks
```

## Development

The first milestone is a demo that can be reviewed with synthetic data. It must not connect to the production inventory, accounting, banking, or ZATCA systems.

See the docs directory for the implementation plan, data model, security rules, deployment path and acceptance criteria.

## Important safeguards

- Demo data is synthetic and resettable.
- Demo role switching is not authentication and must never be presented as secure access control.
- Production authorization must be enforced by the API and database policies, not only by hiding UI controls.
- Issued tax invoices are immutable; corrections use the legally appropriate credit/debit note or cancellation workflow.
- ZATCA requirements, the institution's taxpayer onboarding, and the applicable integration wave must be verified before enabling real invoice issuance.
- Never commit passwords, API tokens, private customer records, bank details or real payment proofs.