# HRM Module User Manual

This manual provides instructions on how to set up and manage the Human Resource Management (HRM) module.

## Overview
The HRM module manages departments, staff details, attendance, leave requests, and payroll processing.

---

## 1. Setup & Configuration

### Department Setup
1. Navigate to `HRM > Departments`.
2. Create departments (e.g., Kitchen, Service, Bar, Logistics).
3. Assign a Manager to each department for approval workflows.

### Staff Onboarding
1. Go to `HRM > Staff Directory`.
2. Select a user profile and click **Add Staff Details**.
3. Fill in the following:
   - **Job Title & Department**
   - **Employment Type:** Full-time, Part-time, Casual, or Contract.
   - **Salary Details:** Base salary and frequency (Daily/Weekly/Monthly).
   - **Banking Information:** For payroll processing.

---

## 2. Attendance & Shifts

### Clocking In/Out
- Staff can clock in/out via their mobile dashboard or the POS terminal.
- GPS coordinates are captured during check-in to verify location.

### Shift Management
- Managers can view daily attendance logs at `HRM > Attendance`.
- System flags "Late" or "Absent" status automatically based on scheduled shifts.

---

## 3. Leave Management

### Requesting Leave
1. Staff navigate to `My Profile > Leave Requests`.
2. Fill in the dates, type (Sick, Vacation, Emergency), and reason.

### Approval Workflow
1. Managers or HRM admins receive a notification.
2. Go to `HRM > Leaves` to **Approve** or **Reject** pending requests.

---

## 4. Payroll Processing

### Generating Payroll
1. Navigate to `HRM > Payroll`.
2. Select the pay period (e.g., "Jan 1 - Jan 31").
3. The system calculates gross pay based on staff details.
4. **Deductions:** Manually add statutory deductions (KRA, NSSF, NHIF) or advances.

### Finalizing Payment
1. Review the net pay.
2. Click **Process Payroll**.
3. This action automatically creates a ledger entry in the `Accounting` module (Debiting Salary Expense, Crediting Cash/Bank).

---

## 5. Roles & Security
- **HRM Manager:** Full access to all staff data, payroll, and department settings.
- **Staff:** Access to their own attendance, leave requests, and payslips only.
