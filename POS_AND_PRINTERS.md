# POS & Printer Setup Manual

This manual provides detailed instructions on how to use the Point of Sale (POS) system and configure printers for receipts and kitchen tickets.

---

## 1. POS Operations

### Starting a Shift
1. Log in with your staff credentials.
2. Navigate to the `POS` dashboard.
3. Click **Start Shift**. Select your role (Waiter, Barman, or Cashier).
4. (Optional) Enter the starting "Cash in Drawer" amount for reconciliation.

### Taking an Order
1. **Select Category:** Browse menu items using the category tabs (e.g., Food, Drinks).
2. **Add to Cart:** Tap an item to add it to the current order.
3. **Modifiers:** If an item has modifiers (e.g., "Well Done", "Extra Cheese"), a popup will appear. Select the customer's preference.
4. **Table Assignment:** For dine-in, enter the Table Number.

### Payment & Closing
1. Click **Checkout**.
2. Select the payment method:
   - **Cash:** Enter amount received to calculate change.
   - **M-Pesa:** Prompt the customer to pay to the Till/Paybill. Enter the transaction code if required.
   - **Loyalty Points:** If the customer has sufficient points, apply them to eligible items.
3. Once paid, click **Complete Order**. The receipt will print automatically.

---

## 2. Printer Setup & Configuration

The system supports two types of print jobs: **Receipts** (for customers) and **Kitchen Tickets** (for chefs/barmen).

### Adding a New Printer
1. Navigate to `Settings > POS Settings > Printers`.
2. Click **Add Printer**.
3. Fill in the details:
   - **Name:** e.g., "Main Receipt Printer" or "Kitchen Printer".
   - **Interface Address:** The IP address (for Network/Wi-Fi printers) or Serial Port (for USB).
   - **Type:** Thermal (usually 80mm or 58mm).
   - **Role:** Select whether this printer handles `Receipts`, `Kitchen Tickets`, or both.

### Kitchen Routing
You can route specific categories to specific printers:
- **Food items** -> Kitchen Printer.
- **Drinks** -> Bar Printer.
- **Configure this in:** `Menu Management > Categories > [Category Name] > Routing`.

---

## 3. Hardware Troubleshooting

### Printer Not Printing
1. **Check Connection:** Ensure the printer is ON and connected to the same network as the POS terminal.
2. **Paper Roll:** Check if the paper is out or jammed.
3. **Status Light:** If the "Error" light is blinking, restart the printer.
4. **IP Address:** Verify that the printer's IP address hasn't changed (Static IP is recommended).

### Missing Items on Kitchen Ticket
- Ensure the category routing is correctly set.
- Check if the item was accidentally marked as "Served" before the ticket was printed.

---

## 4. End of Day Reconciliation
1. At the end of your shift, go to `POS > End Shift`.
2. The system will display the **Total Sales** recorded.
3. **Count Cash:** Enter the physical cash in the drawer.
4. **Submit Report:** Any variance between the system total and physical count will be flagged for the Accountant.
