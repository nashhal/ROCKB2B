---
name: react-best-practices
description: Implement, debug, or refactor ROCK B2B React components, hooks, forms, state, and UI data flows. Use when changing apps/web React code or investigating React rendering and interaction defects.
---

# ROCK B2B React best practices

## Repository reality
- Inspect `package.json` and `apps/web/package.json` before choosing tools or syntax.
- The current web app is React with Vite and JavaScript/JSX. The target architecture mentions TypeScript, but do not assume the migration is complete.
- Main entry points include `apps/web/src/main.jsx` and `apps/web/src/App.jsx`; styles are in `apps/web/src/styles.css`.
- Avoid adding dependencies when native React, browser APIs, or existing packages already solve the requirement.

## Implementation procedure
1. Trace the current data flow, state ownership, event handlers, API calls, and persistence before changing behavior.
2. Keep components focused. Extract a component only when it creates a clear boundary, reusable behavior, or meaningful readability improvement.
3. Keep rendering pure. Do not mutate props, shared records, or arrays/objects held in React state.
4. Use stable keys for mapped elements. Use controlled form fields consistently when their values participate in validation or submission.
5. Follow the Rules of Hooks. Call hooks at component/custom-hook top level, preserve call order, and include accurate effect dependencies.
6. Avoid effects for values that can be derived during render. Use memoization only when it addresses measured or clear repeated work.
7. Handle asynchronous work with explicit loading, success, empty, and error states. Prevent stale requests or state updates when the component lifecycle requires cleanup.
8. Keep API and persistence boundaries explicit. Do not silently switch between server data and browser demo data.
9. Use semantic HTML, labels, accessible names, keyboard-operable controls, and visible focus states.
10. Preserve RTL layout and mixed Arabic/English direction. Keep numeric and identifier formatting deterministic.

## ROCK B2B domain safeguards
- A UI-only role selector is not authorization. Enforce any real permission decision in the server/API layer and verify it independently.
- Never trust browser localStorage for identity, roles, prices, discounts, payment confirmation, or invoice state.
- A bank transfer must remain pending until an authorized finance workflow verifies it.
- Do not transform a demo invoice into a claimed tax invoice. Preserve demo labels and invoice restrictions.
- Keep stock quantity sourced from the existing inventory workflow; do not invent stock synchronization.
- Use synthetic data only and never embed secrets or real personal information in source code.

## Testing and checks
- Add regression tests using the project's existing Node test runner when practical.
- Run `npm test` and `npm run build`; run `npm run check:api` when shared contracts, handlers, or data shapes change.
- Check the actual user flow, not only component snapshots or string assertions, when browser testing is available.
- Do not claim a test ran unless its command completed successfully.

## Avoid
- Unnecessary state duplication and prop drilling that can be replaced with a small clear component boundary.
- Broad rewrites of the large application entry component when a targeted edit is sufficient.
- Unreviewed changes to business calculations, money precision, date handling, role visibility, or persistence.
- New packages, global CSS overrides, or direct DOM manipulation without a specific reason.

## Deliverable
Summarize the component/data flow changed, user-visible behavior, domain rules preserved, tests run, and any known limitations.
