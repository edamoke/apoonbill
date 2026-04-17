# CRM & Loyalty Module User Manual

This manual explains how to use the Customer Relationship Management (CRM) and Loyalty system to drive customer retention.

## Overview
The CRM module tracks customer spend, visit frequency, and loyalty points. Customers earn points for every purchase, which can be redeemed for free items from the rewards catalog.

---

## 1. Setup & Configuration

### Loyalty Point Ratio
- By default, the system awards **1 point for every 100 units spent**.
- **Admin Action:** Adjust the multiplier in `Settings > Loyalty Config` if you want to change the earning rate.

### Rewards Catalog Setup
1. Navigate to `CRM > Rewards Catalog`.
2. Click **Add Reward Item**.
3. Select a Menu Item (e.g., "Draft Beer").
4. Set the **Points Cost** (e.g., 50 points).
5. Ensure `Is Available` is checked.

---

## 2. Customer Engagement

### Member Profiles
- Customers are automatically enrolled when they create an account and place their first order.
- The system tracks `Lifetime Spend` and `Total Orders` to identify VIP customers.

### Social Media Loyalty
- Customers can earn bonus points by sharing their visit on social media.
- Verification is handled in the `CRM > Social Tasks` section by the Social Media Manager.

---

## 3. Using Loyalty Points

### Earning Points
- Points are added automatically when an order status changes to `completed` or `delivered`.
- Points are calculated based on the final order total (excluding delivery fees).

### Redeeming Rewards
1. **At Checkout:** If a customer has enough points, they can select a reward item from their "Loyalty Card" in the cart.
2. **Redemption:** The cost of the item is deducted from their points balance, and the item is added to the order with a zero price.

---

## 4. CRM Analytics

### Customer Insights
- Navigate to `CRM > Analytics`.
- **Top Spenders:** View your highest-value customers.
- **Churn Risk:** Identify customers who haven't visited in over 30 days.
- **Redemption Rate:** Monitor how many points are being redeemed vs. earned to measure program health.

---

## 5. Staff Procedures (POS)
1. Ask the customer for their registered Phone Number or Email.
2. Search for the profile on the POS terminal.
3. The customer's available points balance will be displayed.
4. If they wish to redeem a reward, select the item from the **Loyalty Rewards** tab on the POS.
