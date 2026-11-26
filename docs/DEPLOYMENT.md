# ROCK B2B — preview deployment

## Preview target
Deploy the web demo from the GitHub branch demo-v1. Root Vercel configuration builds the Vite workspace and publishes apps/web/dist.

## Vercel + GitHub setup
1. Import nashhal/ROCKB2B into Vercel.
2. Keep the repository root as the project root.
3. Confirm framework Vite, build command npm run build and output directory apps/web/dist.
4. Use demo-v1 as the preview branch; keep main as the protected production branch.
5. Do not add production credentials. Current demo requires no environment variables.
6. Confirm the build and test the preview on desktop and mobile.

## Local run
- Use Node.js 22.12 or newer.
- Run npm install at the repository root.
- Run npm run dev to start local development.
- Run npm run build before pushing.

## Future API and database
Provision a separate non-production PostgreSQL database before implementing persistence. Add DATABASE_URL only to the hosting provider's encrypted environment variable store. Run Prisma migrations from a reviewed job. Never commit credentials.

## Production cutover
- Replace localStorage with authenticated API calls.
- Complete server-side RBAC and representative data scope.
- Configure private document storage and retention.
- Verify the real inventory workbook mapping.
- Verify ZATCA integration and invoice numbering for the legal entity.
- Complete backup, restore, monitoring and access reviews.
- Obtain owner approval before connecting production data or enabling real invoice issuance.