# CSV-Based CRUD Operations Guide

## Overview

The system now supports **full CRUD operations using CSV files** as the data source. This allows you to test and use the application without setting up Google Sheets integration.

All CSV data is loaded into memory when the app starts, and changes persist during the session (but are not saved back to CSV files automatically).

---

## Key Features

### ✅ What's New

1. **Working Days vs Calendar Days**
   - Added `leave_days` field to Policy sheet with two options: **workday** | **calendarday**
   - **workday**: Monday-Friday only (excludes weekends & public holidays)
   - **calendarday**: All days including weekends & public holidays
   - **Annual, Sick, Paternal, Bereavement, Compassionate** = workday
   - **Maternal** = calendarday (90 total days)

2. **CSV Data Service**
   - Full CRUD operations on all data types
   - In-memory data storage
   - Automatic CSV parsing
   - Export/download functionality

3. **Updated Policies**
   - **Maternal Leave**: 90 calendar days, requires 3 months employment, 90 days advance notice
   - All other leave types use working days

---

## Data Structure

### Policy Sheet (Updated)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| policy_name | string | Policy display name | "Maternal Leave Entitlement" |
| leave_type | string | Leave category | "Maternal" |
| days_entitled | number | Total days allowed | 90 |
| **leave_days** | **string** | **workday or calendarday** | **calendarday** |
| minimum_employment_months | number | Months required | 3 |
| advance_notice_days | number | Notice period | 90 |
| requires_manager_approval | boolean | Manager approval needed | TRUE |
| requires_hr_approval | boolean | HR approval needed | TRUE |
| requires_handover | boolean | Handover doc required | TRUE |
| active | boolean | Is policy active | TRUE |
| last_updated | string | Last update date | "2025-01-01" |
| updated_by | string | Who updated | "ore@curacel.ai" |

### How It Works

- **leave_days = workday**: Monday-Friday only (excludes weekends & public holidays)
  - Example: Annual leave (14 workdays)
  - If request spans Mon-Fri (5 days) = 5 workdays
  - If request spans Mon-Sun (7 days) = 5 workdays (Sat-Sun excluded)

- **leave_days = calendarday**: All calendar days (includes weekends & public holidays)
  - Example: Maternal leave (90 calendar days)
  - If request spans Jan 1 - Mar 31 (90 days) = 90 calendar days
  - Weekends and holidays are included

---

## CSV Files Location

```
project/
├── sample-data/              # Source CSV files
│   ├── employees-template.csv
│   ├── policy-template.csv
│   ├── public-holidays-template.csv
│   └── requests-template.csv
└── public/
    └── sample-data/          # Copied for web access
        ├── employees-template.csv
        ├── policy-template.csv
        ├── public-holidays-template.csv
        └── requests-template.csv
```

The files in `public/sample-data/` are loaded by the web app.

---

## Available CRUD Operations

### Employees

```typescript
// READ
const employees = await csvDataService.getEmployees();
const employee = await csvDataService.getEmployeeByEmail('kabir@curacel.ai');

// CREATE
await csvDataService.createEmployee({
  email: 'new@curacel.ai',
  full_name: 'New Employee',
  manager_email: 'henry@curacel.ai',
  manager_name: 'Henry Okonkwo',
  employment_date: '01/01/2025',
  Current: '2025',
  team: 'Engineering',
  role: 'Developer',
  country: 'Nigeria',
  annual_entitlement: 14,
  annual_taken: 0,
  sick_entitlement: 7,
  sick_taken: 0,
});

// UPDATE
await csvDataService.updateEmployee('kabir@curacel.ai', {
  annual_taken: 10,
});

// DELETE
await csvDataService.deleteEmployee('kabir@curacel.ai');
```

### Policies

```typescript
// READ
const policies = await csvDataService.getPolicies();
const policy = await csvDataService.getPolicyByLeaveType('Annual');

// CREATE (Add new leave type)
await csvDataService.createPolicy({
  policy_name: 'Study Leave Entitlement',
  leave_type: 'Study',
  days_entitled: 10,
  minimum_employment_months: 12,
  advance_notice_days: 30,
  requires_manager_approval: true,
  requires_hr_approval: true,
  requires_handover: true,
  count_as_working_days: true, // Working days
  active: true,
  last_updated: '2025-11-17',
  updated_by: 'ore@curacel.ai',
});

// UPDATE (Change entitlement)
await csvDataService.updatePolicy('Annual', {
  days_entitled: 20, // Increase from 14 to 20
  last_updated: '2025-11-17',
  updated_by: 'ore@curacel.ai',
});

// DELETE
await csvDataService.deletePolicy('Study');
```

### Public Holidays

```typescript
// READ
const holidays = await csvDataService.getPublicHolidays('Nigeria', 2025);
const allHolidays = await csvDataService.getAllHolidays();

// CREATE
await csvDataService.createHoliday({
  country: 'Nigeria',
  holiday_name: 'New Public Holiday',
  holiday_date: '2025-12-31',
  year: 2025,
  is_active: true,
});

// DELETE
await csvDataService.deleteHoliday('Nigeria', '2025-12-31');
```

### Leave Requests

```typescript
// READ
const allRequests = await csvDataService.getRequests();
const userRequests = await csvDataService.getRequestsByEmail('kabir@curacel.ai');
const managerRequests = await csvDataService.getRequestsByManager('henry@curacel.ai');
const hrPending = await csvDataService.getPendingHRRequests();

// CREATE (via validation/submission)
const result = await submitLeaveRequest({
  email: 'kabir@curacel.ai',
  leave_type: 'Annual',
  start_date: '2025-12-01',
  end_date: '2025-12-05',
  handover_document_link: 'https://docs.google.com/...',
});

// UPDATE (approve/reject)
await csvDataService.updateRequest('1731859200000', {
  manager_status: 'Approved',
  manager_decision_date: '2025-11-17',
  manager_comment: 'Approved. Enjoy your leave!',
});

// DELETE
await csvDataService.deleteRequest('1731859200000');
```

---

## Export/Download Data

You can export the current in-memory data to CSV format:

```typescript
// Export to CSV string
const csv = csvDataService.exportToCSV('employees');

// Download as CSV file
csvDataService.downloadCSV('employees', 'employees-export.csv');
csvDataService.downloadCSV('policies', 'policies-export.csv');
csvDataService.downloadCSV('holidays', 'holidays-export.csv');
csvDataService.downloadCSV('requests', 'requests-export.csv');
```

---

## Testing the System

### 1. Test Working Days vs Calendar Days

**Annual Leave (Working Days)**
```typescript
// Request: Mon Dec 1 - Fri Dec 5 (5 calendar days)
// Result: 5 working days (no weekends)

await submitLeaveRequest({
  email: 'kabir@curacel.ai',
  leave_type: 'Annual',
  start_date: '2025-12-01', // Monday
  end_date: '2025-12-05',   // Friday
  handover_document_link: 'https://docs.google.com/...',
});
// Expected: calculated_days = 5 (working days)
```

**Annual Leave with Weekend (Working Days)**
```typescript
// Request: Mon Dec 1 - Mon Dec 8 (8 calendar days)
// Result: 6 working days (excludes Sat-Sun)

await submitLeaveRequest({
  email: 'kabir@curacel.ai',
  leave_type: 'Annual',
  start_date: '2025-12-01', // Monday
  end_date: '2025-12-08',   // Monday (next week)
  handover_document_link: 'https://docs.google.com/...',
});
// Expected: calculated_days = 6 (excludes Dec 6-7 weekend)
```

**Maternal Leave (Calendar Days)**
```typescript
// Request: 90 calendar days
// Result: 90 days (includes weekends & holidays)

await submitLeaveRequest({
  email: 'jane@curacel.ai',
  leave_type: 'Maternal',
  start_date: '2026-01-01',
  end_date: '2026-03-31', // 90 calendar days
  handover_document_link: 'https://docs.google.com/...',
});
// Expected: calculated_days = 90 (calendar days, not working days)
```

### 2. Test CRUD Operations

Open browser console and test:

```javascript
// Import the service
import { csvDataService } from './services/csvDataService';

// Get all employees
const employees = await csvDataService.getEmployees();
console.log('Employees:', employees);

// Update an employee
await csvDataService.updateEmployee('kabir@curacel.ai', {
  annual_taken: 5,
});

// Check updated data
const kabir = await csvDataService.getEmployeeByEmail('kabir@curacel.ai');
console.log('Updated Kabir:', kabir);

// Get all policies
const policies = await csvDataService.getPolicies();
console.log('Policies:', policies);

// Find maternal policy
const maternal = policies.find(p => p.leave_type === 'Maternal');
console.log('Maternal policy:', maternal);
console.log('Counts as working days?', maternal.count_as_working_days); // Should be false
```

---

## Date Format Notes

### Employee CSV Format
- **employment_date**: `DD/MM/YYYY` (e.g., "15/01/2023")
- Automatically parsed to JavaScript Date by `parseDDMMYYYY()` function

### Request Format
- **start_date**, **end_date**: `YYYY-MM-DD` (e.g., "2025-12-01")
- ISO 8601 format for consistency

### Holiday Format
- **holiday_date**: `YYYY-MM-DD` (e.g., "2025-12-25")

---

## Validation Logic

### Working Days Calculation
```typescript
if (policy.count_as_working_days) {
  calculatedDays = calculateWeekdays(startDate, endDate, publicHolidays);
  // Excludes: Saturdays, Sundays, and public holidays
} else {
  calculatedDays = calculateCalendarDays(startDate, endDate);
  // Includes: All days (weekends + holidays)
}
```

### Policy-Based Validation
1. Employee exists?
2. Policy exists and active?
3. Valid date range?
4. Calculate days (working or calendar based on policy)
5. Employment duration meets minimum?
6. Advance notice requirement met?
7. Sufficient leave balance?
8. Handover document provided (if required)?

---

## Migration to Google Sheets

When ready to migrate from CSV to Google Sheets:

1. Set `USE_CSV = false` in `leaveValidation.ts`
2. Follow `GOOGLE_SHEETS_SETUP.md`
3. Import CSV data into Google Sheets
4. Update `.env` with Spreadsheet ID
5. All CRUD operations will now use Google Sheets API

---

## Troubleshooting

### CSV files not loading
- Check `public/sample-data/` folder exists
- Verify CSV files are properly formatted
- Check browser console for errors

### Working days calculation incorrect
- Verify `count_as_working_days` field in Policy CSV
- Check public holidays are loaded for the employee's country
- Ensure date range doesn't fall entirely on weekends/holidays

### CRUD operations not persisting
- Remember: CSV mode uses in-memory storage
- Changes persist during session only
- Use `downloadCSV()` to export changes
- For persistence, migrate to Google Sheets

---

## Summary

✅ **CSV CRUD is fully functional**
✅ **Working days vs calendar days supported**
✅ **Maternal leave uses 90 calendar days**
✅ **All other leave types use working days**
✅ **Full in-memory CRUD operations**
✅ **Export/download functionality**
✅ **Ready to test without Google Sheets**

Visit **http://localhost:8081** to test the application!
