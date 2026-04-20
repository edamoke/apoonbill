# Guide: How to Create User Manuals

This guide explains the standard process for creating detailed user manuals for the The Spoonbill modules.

## Standard Structure for Manuals
To ensure consistency across all modules, every manual should follow this structure:

1.  **Overview:** A high-level explanation of what the module does.
2.  **Setup & Configuration:** Technical or administrative steps required before daily use.
3.  **Core Workflows:** Step-by-step instructions for the primary tasks performed in the module.
4.  **Reporting & Insights:** How to extract and interpret data from the module.
5.  **Roles & Permissions:** Who can access what within the module.

---

## Steps to Create a New Manual

### 1. Research the Schema
Look into the `scripts/` directory to understand the database structure.
- **Why?** It tells you what data the module captures (e.g., `loyalty_points`, `gross_pay`).
- **Command:** `ls scripts/*module_name*`

### 2. Analyze the UI/UX
Check the `app/` and `components/` directories to see the actual user interface.
- **Why?** It helps you describe the navigation paths (e.g., `Accountant > Reports > P&L`).
- **Command:** `ls app/module_name`

### 3. Identify Automation
Look for database triggers (`CREATE TRIGGER`) in the SQL scripts.
- **Why?** Users need to know what happens "under the hood" (e.g., "Points are added automatically when an order is completed").

### 4. Draft the Markdown
Use clear, actionable language.
- Use **Bold** for UI elements (buttons, menus).
- Use `Code` for technical terms or paths.
- Use Numbered lists for sequences and Bullet points for features.

---

## Best Practices
- **Be Concise:** Users want to solve problems quickly. Avoid fluff.
- **Include Paths:** Always specify where to find a feature (e.g., "Go to `Settings > Profile`").
- **Define Roles:** Explicitly state which roles (Admin, Accountant, Staff) have access to the features described.
- **Update Regularly:** When the code changes (e.g., a new column is added to a table), update the manual immediately.
