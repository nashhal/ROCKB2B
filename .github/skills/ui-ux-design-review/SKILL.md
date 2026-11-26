---
name: ui-ux-design-review
description: Review or improve ROCK B2B screens, dashboards, navigation, forms, tables, charts, typography, accessibility, and visual consistency. Use when a task changes the appearance or usability of the React application, or when the user asks for a professional interface review.
---

# ROCK B2B UI/UX design review

## Inspect first
1. Read `apps/web/src/App.jsx`, `apps/web/src/styles.css`, `apps/web/index.html`, and `apps/web/src/main.jsx`.
2. Review the relevant product requirements in `README.md`, `docs/ARCHITECTURE.md`, and `docs/ACCEPTANCE_TESTS.md`.
3. Identify every affected role view and state before changing components: owner/management, finance, and representative views may expose different navigation and actions.
4. Check whether the requested component already exists. Extend the current design system instead of creating a parallel visual language.

## ROCK visual direction
- Keep the interface premium, restrained, clear, and business-focused.
- Prefer white and light neutral surfaces with navy `#071a33` and blue `#1479dc` accents.
- Use subtle borders and restrained shadows. Avoid excessive gradients, glows, oversized rounded cards, decorative animation, and generic AI-dashboard styling.
- Preserve the official ROCK wordmark and existing app icon. Never replace the supplied brand artwork with a text approximation.
- Arabic is the primary interface language and must remain correct RTL. English labels, codes, and Latin identifiers must remain legible LTR where appropriate.
- The current typography pairing is Noto Naskh Arabic for Arabic glyphs and Manrope for Latin/English glyphs. Inspect the actual CSS before changing font loading or fallbacks.
- Use consistent spacing, heading hierarchy, icon sizing, button heights, table density, and form field states.

## Review procedure
1. Map the page structure: page title, supporting text, primary action, filters, content, and secondary actions.
2. Review normal, hover, focus, active, disabled, loading, empty, success, and error states where relevant.
3. Check information hierarchy and scanability. Prioritize core business actions; do not hide financial reports, representative management, or other authorized navigation.
4. Check data readability: amounts, dates, IDs, status labels, Arabic names, English identifiers, and mixed-direction content.
5. Check keyboard use, visible focus, accessible names, semantic buttons/links, contrast, and reduced-motion behavior.
6. Check narrow screens and ensure menus, filters, dialogs, tables, and action groups remain usable.

## Safety and behavior constraints
- A visual redesign must not silently change business rules, permission checks, pricing, discounts, payment states, invoice behavior, or data persistence.
- Do not imply the role selector or browser storage is secure authentication or authorization.
- Keep the demo notice and the “DEMO — NOT A TAX INVOICE” boundary visible where applicable.
- Never insert real customer, financial, or personal information into screenshots, examples, or seed data.

## Validation
- Run `npm test` and `npm run build` from the repository root.
- Run `npm run check:api` if UI changes touch API contracts or shared data shapes.
- Verify the actual page at desktop and mobile sizes when browser tooling is available. Do not claim visual browser verification if only source inspection was performed.
- Add or update a focused regression test for a repeated layout or interaction bug.

## Deliverable
Report the affected screens and files, notable design decisions, role views checked, validation commands and outcomes, and any visual behavior not verified.
