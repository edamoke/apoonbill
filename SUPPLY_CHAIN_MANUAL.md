# Mama Jos - Supply Chain Operations Manual

This manual provides a comprehensive guide to managing the end-to-end supply chain within the Mama Jos system. It covers everything from onboarding suppliers to processing payments and auditing inventory.

---

## 1. Supplier Management
Before you can place orders, you must have your suppliers configured in the system.

### Adding a Supplier
1.  Navigate to **Admin > Suppliers**.
2.  Click **"Add New Supplier"**.
3.  Enter the supplier's company name, primary contact person, email, and phone number.
4.  **Category**: Specify what they provide (e.g., Poultry, Dry Goods, Beverages).
5.  Click **"Save"**.

---

## 2. Inventory & Stock Monitoring
The system helps you stay ahead of shortages by tracking current levels.

- **Inventory Dashboard**: Navigate to **Admin > Inventory** to see a list of all raw materials and their current stock levels.
- **Low Stock Alerts**: Items that fall below their "Minimum Stock Level" will automatically trigger alerts. These are visible on the main Admin Dashboard for immediate attention.

---

## 3. The Ordering Workflow
When inventory is low, follow these steps to restock.

### Creating a Supply Order
1.  Navigate to **Admin > Supply Chain**.
2.  Click **"New Supply Order"**.
3.  **Select Supplier**: Choose the vendor from your list.
4.  **Add Items**: Pick the inventory items you need.
5.  **Specify Quantity**: Enter the quantity required for each item.
6.  **Expected Delivery**: Set the date you expect the goods to arrive.
7.  Click **"Place Order"**.

*The order status will now be set to `pending_delivery`.*

---

## 4. Delivery & Receiving
Properly recording the arrival of goods ensures your stock levels are always accurate.

### Marking an Order as Delivered
1.  Navigate to **Admin > Supply Chain > Orders**.
2.  Locate the order that has arrived and click **"Edit/Update"**.
3.  **Verify Quantities**: Confirm that the amount delivered matches what you ordered.
4.  **Attach Documents**: Enter the **Invoice Number** and **Delivery Note** details provided by the supplier.
5.  **Record Weight**: If applicable (e.g., meat/veg), record the actual weight received.
6.  Change the status to **"Delivered"** and click **"Save"**.

**SYSTEM AUTOMATION**: Once you save the order as "Delivered", the system will **automatically increase the stock levels** for all items in that order.

---

## 5. Payment Workflow
Manage your debts and track your cash outflow.

### Recording a Payment
1.  Navigate to **Admin > Suppliers > Payments**.
2.  Click **"Record Payment"**.
3.  **Select Supplier**: Choose the supplier you are paying.
4.  **Select Invoices**: The system will show a list of outstanding "Delivered" orders that haven't been fully paid.
5.  **Payment Method**: Choose how you are paying (Cash, Bank Transfer, M-Pesa).
6.  **Amount**: Enter the payment amount.
7.  Click **"Confirm Payment"**.

*The supplier's balance will be automatically updated.*

---

## 6. Audit & Performance
Use reports to optimize your procurement.

- **Supplier Performance**: View reports on which suppliers deliver on time and which have frequent discrepancies in quantity/weight.
- **Cost Analysis**: Track price fluctuations of raw materials over time to adjust your menu pricing accordingly.
- **Audit Trail**: Every change to an inventory level or payment is logged with the user's name and timestamp.

---

*For technical support or feature requests, please contact your system integrator.*
