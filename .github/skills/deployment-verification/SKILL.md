---
name: deployment-verification
description: Verify ROCK B2B Vercel or other hosting deployments, preview versus production target, source commit, build status, domains, caching, and release readiness. Use before announcing that a deployment is live or when deployment behavior is unclear.
---

# ROCK B2B deployment verification

## Read current configuration
Before each deployment task, inspect:
- `docs/DEPLOYMENT.md`
- `vercel.json`
- Root `package.json`
- `.github/workflows/ci.yml`
- Current hosting project settings and recent deployment records, when connected.

The documentation may be older than the live provider configuration. Confirm branch mappings, build command, output directory, root directory, environment variables, and aliases from current settings rather than guessing.

## Current documented build baseline
The Vite workspace build is `npm run build`, and the documented output directory is `apps/web/dist`. The repository-level CI uses Node 22. Re-check these values before relying on them.

## Verification procedure
1. Identify the exact commit SHA intended for deployment and confirm it is on the expected branch.
2. Inspect the deployment record for that SHA. Confirm its state is `READY` and its target is explicitly `preview` or `production`.
3. Never treat a ready preview deployment as production.
4. For production claims, confirm the deployment target is `production`, the production domain/alias resolves to that deployment, and the deployed source SHA matches the intended commit.
5. For preview claims, report the preview URL and clearly state any SSO or deployment-protection requirement.
6. Check build logs for successful install, build, and output generation.
7. When access is available, smoke-test the deployed app: login/demo entry, navigation, role views, reports, forms, mobile drawer, and a core synthetic-data flow.
8. Check service-worker cache version and static asset behavior after UI releases. A deployment can be correct while a browser continues to use an older cached shell.
9. Verify environment separation. Preview must not use production customer or finance data. Never copy secrets between environments.

## Release safeguards
- Do not promote or trigger a production deployment unless the user explicitly asked for that action and the production readiness requirements have been reviewed.
- Do not bypass deployment protection, SSO, approvals, branch protections, or quota limits.
- If provider limits, protection, or permission errors block verification, explain the blocker and do not claim the release is complete.
- A successful GitHub merge or CI run alone does not prove a Vercel deployment is live.
- Do not expose environment variable values, tokens, or credential-bearing URLs.

## Report
Include the commit SHA, branch, provider deployment state, target, deployment URL, production alias status, smoke tests performed, and unresolved blockers. Use precise language: “merged”, “build passed”, “preview ready”, and “production live” are different states.
