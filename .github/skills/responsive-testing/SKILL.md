---
name: responsive-testing
description: Test ROCK B2B responsive behavior and core UI interactions on phones, tablets, and desktop. Use for layout regressions, RTL overflow, mobile menus, dialogs, tables, forms, or end-to-end acceptance checks.
---

# ROCK B2B responsive and interaction testing

## Read the acceptance contract
Start with `docs/ACCEPTANCE_TESTS.md` and inspect the current page styles and component markup. The documented viewport widths are part of the project's acceptance criteria.

## Required viewport matrix
Check these widths at minimum:
- 360 px and 390 px: compact phones.
- 768 px: tablet breakpoint and historically sensitive layout width.
- 1024 px: small laptop/tablet landscape.
- 1280 px or wider: desktop workspace.

At each width, check:
- No unintended page-level horizontal overflow.
- Navigation and the mobile sidebar/drawer open, close, and remain keyboard accessible.
- Page title, breadcrumbs, user/role controls, notices, and primary actions do not collide.
- KPI cards and dashboard columns reflow without clipping.
- Filters and forms remain visible and usable.
- Modals fit the viewport and can scroll internally when content is long.
- Wide tables scroll inside their own wrapper instead of widening the whole page.
- Arabic text remains RTL; English IDs and values remain readable and do not reverse punctuation.
- Reduced-motion preference does not hide essential content or controls.

## Core business demo flows
Use only synthetic demo data. Where the current app supports the flow, test:
1. Search and add a customer; refresh and confirm expected demo persistence.
2. Search or add a product and review its displayed price and optional stock field.
3. Create a demo order and check its status and invoice preview.
4. Exercise a discount within and above the configured limit.
5. Record a cash receipt and a pending bank-transfer record; verify that bank transfer is not treated as confirmed before finance review.
6. Register a visit/contact and confirm it appears in the activity view.
7. Verify finance and representative navigation visibility matches the intended demo presentation.

Do not infer secure multi-user authorization from a role-preview screen.

## Tooling and honest verification
- Inspect root `package.json` and installed dependencies before using a browser automation framework.
- The checked-in baseline includes Node's built-in `node:test` tests. Do not assume Playwright, Cypress, or browser binaries are installed; do not add a large testing dependency without a clear need.
- If browser automation is available, use it to inspect actual layout, console errors, keyboard interactions, and screenshots at the viewport matrix.
- If only static tests are available, add focused regression checks and state clearly that visual browser verification was not performed.

## Standard checks
Run from the repository root:
```sh
npm test
npm run check:api
npm run build
```
Run the checks relevant to the changed surface and report exact outcomes.

## Defect report format
For each issue, record:
- viewport width and affected screen;
- reproducible steps;
- observed result and expected result;
- likely component or CSS selector;
- severity and proposed minimal fix.

Do not mark a layout as fixed until the affected viewport and interaction have been checked again.
