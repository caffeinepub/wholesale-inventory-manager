# Wholesale Inventory Manager

## Current State
App exists with full inventory management (products with price/SKU/category), stock movements, reports, and dashboard.

## Requested Changes (Diff)

### Add
- Customer management module: add/edit/delete customers
- Customer fields: name, phone, address, purchaseDate (date of purchase), lastPaymentDate, outstandingBalance
- Customer list view with outstanding balance and payment dates visible

### Modify
- Inventory product form: simplify to only name and quantity (amount). Remove SKU, category, unit, cost price, selling price, reorder level.
- Stock movement: only quantity (amount) is required when recording in/out. Remove note field complexity.
- Reports: show product name and quantity only (no price columns)
- Dashboard: remove inventory value card (no prices). Keep total products and low stock count.

### Remove
- Product fields: SKU, category, unit, costPrice, sellingPrice, reorderLevel
- Any price-related displays throughout the app

## Implementation Plan
1. Regenerate backend with simplified Product (name, quantity only) and new Customer entity
2. Update frontend: simplify product form and tables to name + quantity
3. Add Customers page with CRUD and table showing outstanding balance, last payment date, purchase date
