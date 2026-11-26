---
name: github-actions-debugging
description: Diagnose and fix ROCK B2B GitHub Actions failures, queued or cancelled checks, Node/npm install errors, API syntax failures, test failures, and Vite build errors. Use when a workflow run is red or CI behavior needs maintenance.
---

# ROCK B2B GitHub Actions debugging

## Workflow baseline
Inspect `.github/workflows/ci.yml` before changing CI. The current workflow:
- Runs for pushes to `main`, `demo-v1`, and `backend-v1`, and for pull requests targeting those branches.
- Uses Ubuntu and Node.js 22.
- Installs with `npm install`.
- Runs `npm run check:api`, `npm test`, and `npm run build`.

Inspect root `package.json` for the actual scripts; do not assume a lockfile or substitute `npm ci` without confirming the repository supports it.

## Failure triage
1. Identify the exact workflow run, commit SHA, branch, event, job, and failed step.
2. Read the full failed-step log and surrounding setup/install output. Do not diagnose from a red badge alone.
3. Reproduce the failing command from the repository root using Node 22 and the same dependency-install strategy.
4. Separate infrastructure/transient failures from code, dependency, test, permissions, and workflow-configuration failures.
5. Fix the earliest root cause. Do not hide downstream errors by changing job order or disabling checks.
6. Add or update a focused regression test when the failure exposed a repeatable defect.
7. Re-run the complete relevant workflow and verify every required job/step is successful.

## Safe workflow maintenance
- Keep workflow permissions least-privilege and scoped to the jobs that need them.
- Pin third-party actions to reviewed versions or immutable SHAs where repository policy requires it.
- Never print secrets or dump the full environment.
- Never place tokens or passwords in workflow YAML, command-line arguments, artifacts, or logs.
- Keep preview and production credentials separate; avoid adding production secrets to demo workflows.
- Do not add deployment steps or production publishing as a side effect of a CI repair.
- Preserve test, syntax, and build gates. A passing build does not replace tests or security review.

## Repository validation
Run the exact commands used in CI:
```sh
npm install
npm run check:api
npm test
npm run build
```

For a targeted local reproduction, run the failing command first, then run all required checks before declaring the branch ready.

## Report
State the run URL/ID, commit and branch, failed step, root cause, files changed, exact validation results, and anything that could not be reproduced. Do not report success while a required check is still queued, in progress, or failed.
