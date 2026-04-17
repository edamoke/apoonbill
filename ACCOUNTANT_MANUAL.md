# Accountant Module User Manual

This manual provides detailed instructions on how to set up and use the Accountant module within the Mama Jos system.

## Overview
The Accountant module is designed to handle all financial aspects of the venue, including double-entry bookkeeping, general ledger management, sales reconciliation, supplier payments, and financial reporting (P&L, Sales Analysis).

---

## 1. Setup & Configuration

### Role Assignment
To access the Accountant module, a user must have the `accountant` role or have `is_accountant` set to true in their profile.
- **Admin Action:** Go to User Management and update the staff member's role to "Accountant".

### Chart of Accounts (CoA)
The system comes pre-seeded with a standard Chart of Accounts. 
- **Location:** `Accounting > Settings > Chart of Accounts`
- **Initial Categories:**
  - `1000` - Cash & Bank (Asset)
  - `2000` - Accounts Payable (Liability)
  - `4000` - Sales Revenue (Revenue)
  - `5000` - Cost of Goods Sold (Expense)
- **Adding Accounts:** You can add custom sub-accounts (e.g., `1010 - M-Pesa Till`) to track specific payment channels.

### Automated Triggers
The system is configured to automatically create ledger entries when:
- An order is marked as `completed` or `delivered` (Debits Cash, Credits Revenue).
- A supply order is received (Debits Inventory, Credits Accounts Payable).

---

## 2. Daily Operations

### Sales Reconciliation
1. Navigate to `Accountant > Orders`.
2. Review the "Acceptance Queue" for pending orders that need financial verification.
3. Compare the system total with the actual cash/M-Pesa reports from the POS.

### Expense Logging
1. Go to `Accountant > Expenses`.
2. Click **Record Expense**.
3. Select the appropriate account (e.g., `5200 - Utilities`), enter the amount, and upload a receipt (optional).

### Supplier Payments
1. Navigate to `Accountant > Suppliers > Payments`.
2. View outstanding balances for suppliers.
3. Mark payments as "Paid" once the bank/M-Pesa transaction is completed to clear the `Accounts Payable` liability.

### Wastage & Utility Tracking
- **Wastage:** Monitor stock loss at `Accountant > Reports > Stock Analysis`.
- **Gas/Utilities:** Log gas refills and usage in the `Utilities` section to accurately calculate operational costs.

---

## 3. Financial Reporting

### Profit & Loss (P&L) Statement
- **Path:** `Accountant > Reports > P&L`
- **Function:** Generates a real-time view of Revenue vs. Expenses.
- **Filters:** View by Day, Week, Month, or custom date range.

### Sales Analysis
- **Path:** `Accountant > Reports > Sales`
- **Insight:** Identify top-selling items, peak sales hours, and revenue distribution across different outlets (Bar, Restaurant, VIP).

---

## 4. Troubleshooting
- **Unbalanced Ledger:** If debits and credits don't match, check `General Ledger > Manual Journal Entries` for any manual corrections that might have been entered incorrectly.
- **Permission Denied:** Ensure your profile has the `accountant` role assigned in the `profiles` table.
