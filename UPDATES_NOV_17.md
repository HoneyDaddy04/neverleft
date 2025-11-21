# Updates - November 17, 2025

## 🎯 What Changed

### 1. **Working Days vs Calendar Days** ✅

**Problem**: Maternal leave should be 90 calendar days (not working days), but all other leave types should count working days.

**Solution**: Added `count_as_working_days` field to Policy sheet.

| Leave Type | Days | Type | Calculation |
|------------|------|------|-------------|
| Annual | 14 | Working | Excludes weekends & holidays |
| Sick | 7 | Working | Excludes weekends & holidays |
| Paternal | 5 | Working | Excludes weekends & holidays |
| **Maternal** | **90** | **Calendar** | **Includes weekends & holidays** |
| Bereavement | 3 | Working | Excludes weekends & holidays |
| Compassionate | 5 | Working | Excludes weekends & holidays |

**Example**:
- **Annual Leave**: Request Dec 1-8 (8 calendar days) = **6 working days** (excludes weekend)
- **Maternal Leave**: Request Jan 1 - Mar 31 (90 calendar days) = **90 calendar days** (includes all days)

---

### 2. **CSV-Based CRUD Operations** ✅

**Problem**: Need to test the system without Google Sheets setup.

**Solution**: Created full CSV data service with in-memory CRUD operations.

**Features**:
- ✅ Read employees, policies, holidays, requests from CSV
- ✅ Create, update, delete operations on all data types
- ✅ In-memory storage (persists during session)
- ✅ Export/download data to CSV
- ✅ Automatic CSV parsing with PapaParse
- ✅ Date format handling (DD/MM/YYYY for employees)

**Files Created**:
- `src/services/csvDataService.ts` - Full CRUD service
- `public/sample-data/*.csv` - CSV files for web access

---

### 3. **Updated Policy Configuration** ✅

**Maternal Leave Policy Changes**:
- Days entitled: 90 (calendar days)
- Minimum employment: **3 months** (changed from 6)
- Advance notice: **90 days** (changed from 60)
- count_as_working_days: **FALSE** (new field)

All other policies: count_as_working_days = **TRUE**

---

### 4. **Updated Validation Logic** ✅

**Enhanced Features**:
- Checks `count_as_working_days` field in policy
- Uses `calculateWeekdays()` for working days calculation
- Uses `calculateCalendarDays()` for calendar days calculation
- Handles DD/MM/YYYY date format from CSV
- Uses CSV data service instead of Google Sheets

**Validation Flow**:
```
1. Get employee from CSV
2. Get policy from CSV
3. Parse dates
4. Get public holidays for employee's country
5. Calculate days (working OR calendar based on policy)
6. Validate employment duration
7. Validate advance notice
8. Check leave balance
9. Verify handover document
10. Determine approval routing
11. Return validation result
```

---

## 📁 Files Modified

### Created
- `src/services/csvDataService.ts` - CSV CRUD service
- `CSV_CRUD_GUIDE.md` - Complete CRUD documentation
- `UPDATES_NOV_17.md` - This file

### Modified
- `sample-data/policy-template.csv` - Added `count_as_working_days` column
- `src/services/leaveValidation.ts`:
  - Added `calculateCalendarDays()` function
  - Added `parseDDMMYYYY()` function
  - Updated `validateLeaveRequest()` to use CSV service
  - Updated `submitLeaveRequest()` to use CSV service
  - Added working days vs calendar days logic
- `src/pages/LeaveRequest.tsx` - Updated to use CSV service
- `public/sample-data/` - Copied CSV files for web access

---

## 🚀 How to Use

### Run the App
```bash
npm run dev
```
Visit: http://localhost:8081

### Test Working Days vs Calendar Days

**Test Annual Leave (Working Days)**:
1. Go to "Request Leave"
2. Select "Annual" leave type
3. Choose dates: Dec 1-8, 2025 (includes weekend)
4. Expected: **6 working days** (excludes Sat-Sun)

**Test Maternal Leave (Calendar Days)**:
1. Select "Maternal" leave type
2. Choose dates spanning 90 calendar days
3. Expected: **90 calendar days** (includes weekends)

### Test CRUD Operations

Open browser console:
```javascript
import { csvDataService } from './services/csvDataService';

// View all employees
const employees = await csvDataService.getEmployees();
console.log(employees);

// View all policies
const policies = await csvDataService.getPolicies();
console.log(policies);

// Check maternal policy
const maternal = policies.find(p => p.leave_type === 'Maternal');
console.log('Maternal counts as working days?', maternal.count_as_working_days); // false

// Update employee balance
await csvDataService.updateEmployee('kabir@curacel.ai', {
  annual_taken: 10
});

// Export data
csvDataService.downloadCSV('requests', 'my-requests.csv');
```

---

## 📊 Policy Sheet Structure (Updated)

```csv
policy_name,leave_type,days_entitled,minimum_employment_months,advance_notice_days,requires_manager_approval,requires_hr_approval,requires_handover,count_as_working_days,active,last_updated,updated_by
Annual Leave Entitlement,Annual,14,6,7,TRUE,TRUE,TRUE,TRUE,TRUE,2025-01-01,ore@curacel.ai
Maternal Leave Entitlement,Maternal,90,3,90,TRUE,TRUE,TRUE,FALSE,TRUE,2025-01-01,ore@curacel.ai
```

**Key Field**: `count_as_working_days`
- TRUE = Excludes weekends & public holidays
- FALSE = Includes all calendar days

---

## ✅ Testing Checklist

- [x] Annual leave excludes weekends
- [x] Annual leave excludes public holidays
- [x] Maternal leave counts calendar days
- [x] CSV files load successfully
- [x] CRUD operations work on employees
- [x] CRUD operations work on policies
- [x] CRUD operations work on holidays
- [x] CRUD operations work on requests
- [x] Export/download functionality works
- [x] Date parsing (DD/MM/YYYY) works
- [x] Validation uses CSV data
- [x] Leave request submission works

---

## 🔄 Migration Path

Currently using: **CSV data (in-memory)**

To migrate to Google Sheets:
1. Open `src/services/leaveValidation.ts`
2. Change `const USE_CSV = true;` to `const USE_CSV = false;`
3. Follow `GOOGLE_SHEETS_SETUP.md`
4. All CRUD will use Google Sheets API

---

## 📖 Documentation

- **README.md** - Project overview
- **GOOGLE_SHEETS_SETUP.md** - Google Sheets setup guide
- **IMPLEMENTATION_SUMMARY.md** - What's been built
- **CSV_CRUD_GUIDE.md** - CSV CRUD operations guide ⭐ NEW
- **UPDATES_NOV_17.md** - This update summary ⭐ NEW

---

## 🎉 Summary

✅ **Working days vs calendar days** - Fully implemented
✅ **CSV CRUD operations** - Fully functional
✅ **Maternal leave** - 90 calendar days (3 months min, 90 days notice)
✅ **Policy-based calculation** - Configurable via CSV
✅ **No Google Sheets required** - Test with CSV files
✅ **Export/download** - Save your data anytime

**The system is ready to test!** 🚀

All your requirements have been implemented:
- Maternal = calendar days (90 total)
- All others = working days
- Full CRUD on CSV files
- Easy migration to Google Sheets when ready
