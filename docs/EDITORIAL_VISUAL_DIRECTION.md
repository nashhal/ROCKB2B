# ROCK B2B — Editorial Interface Direction

This document records the visual direction implemented in the dashboard refresh.

## Purpose

The interface should feel like a serious, established B2B operations product rather than a generic dashboard template. Prioritize hierarchy, contrast, useful information density, clear actions, and consistent component behavior.

## Visual system

- Primary ink: ROCK navy `#071a33`.
- Primary action: electric blue `#086bdd`.
- Main canvas: cool neutral `#f1f4f7`.
- Surfaces: white, with visible but restrained borders.
- Use squared-off geometry: compact 4–6px radii for core workspace controls and tables.
- Avoid decorative gradients, oversized rounded cards, soft low-contrast typography, unnecessary glows, and shadows that do not establish hierarchy.
- Preserve the original ROCK logo and app icon assets.

## Dashboard hierarchy

1. A strong navy command header with a concise page title and clear primary action.
2. Four high-contrast KPIs with distinct top rules and legible numeric values.
3. Sales and collection trend alongside representative performance.
4. A full-width latest-orders table with clear status labels and a direct route to all orders.
5. Keep the demo-data notice visible and factual.

## Arabic and English

- Arabic is the primary language and uses Noto Naskh Arabic.
- Latin labels, IDs, dates, and numbers use Manrope.
- Preserve RTL layout while explicitly keeping identifiers and numeric values LTR where appropriate.

## Interaction and responsive behavior

- Use clear active, hover, focus, disabled, loading, empty, success, and error states.
- Keep the primary dashboard actions visible at narrow widths.
- Stack the dashboard analytics panels on mobile without hiding key information.
- Keep tables horizontally scrollable within their own container.
- Respect reduced-motion preferences.

## Product boundaries

This is still a review prototype using synthetic data. Styling does not imply production readiness, tax-invoice compliance, or secure role-based authorization. Do not change business rules, pricing, permissions, or persistence behavior as part of visual-only changes.
