# ROCK B2B — architecture decisions

- Separate repository: nashhal/ROCKB2B; do not mix with the ROCK storefront.
- Demo branch: demo-v1; main remains the integration / production candidate.
- Demo data: synthetic browser-local state for first review; no real business records.
- Inventory: existing inventory system remains source of truth for stock and warehouse operations.
- Product import: reviewed XLSX / CSV snapshots matched by SKU.
- Representative invoice action: production issuance must use the institution's approved compliant invoicing solution. Do not create a second legal invoice-number sequence.
- Payments: credit is a payment term, not a payment; bank transfers remain pending until finance verifies; partial payment allocation is supported.
- Identity: ROCK B2B uses ROCK navy and electric-blue palette. Current R mark is a temporary demo mark until the official logo is supplied.