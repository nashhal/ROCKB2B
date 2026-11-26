# ROCK B2B — Demo V1 acceptance checks

## Browser / layout
- [ ] RTL layout has no horizontal overflow at 360, 390, 768, 1024 and desktop widths.
- [ ] Sidebar becomes a usable mobile drawer.
- [ ] Demo badge and tax-invoice warning remain visible.

## Customers and products
- [ ] Search customers by name, phone and city.
- [ ] Add a customer and confirm it remains after refresh.
- [ ] Add a sample product.
- [ ] Import a valid XLSX with SKU, product name and sale price.
- [ ] Reject an import with missing required columns.
- [ ] Re-importing an existing SKU updates it rather than duplicating it.
- [ ] Export the invoice list to CSV.

## Sales
- [ ] Create a field order using cash.
- [ ] Create a remote order using credit.
- [ ] Apply discount within representative limit.
- [ ] Apply discount above limit and verify order waits for approval.
- [ ] Approve pending discount as owner / manager and create a demo invoice.
- [ ] Verify representative role preview hides finance / management navigation.

## Payments
- [ ] Record a cash receipt within the invoice balance.
- [ ] Record a bank transfer and verify it stays pending.
- [ ] Confirm bank transfer as finance / owner and update the invoice balance.
- [ ] Reject amounts larger than the outstanding balance.

## Activities
- [ ] Create a field visit and a remote contact activity.
- [ ] Confirm the activity appears in the visits register.

Passing these checks validates only the browser demo. It does not validate secure authentication, multi-user synchronization, legal accounting, ZATCA compliance, bank settlement, production authorization or backups.