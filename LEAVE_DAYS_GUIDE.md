# Leave Days Calculation Guide

## Overview

The system now uses a clear `leave_days` field in the Policy sheet to determine how leave is calculated.

---

## Leave Days Options

| Value | Description | Calculation |
|-------|-------------|-------------|
| **workday** | Working days only | Monday - Friday (excludes weekends & public holidays) |
| **calendarday** | Calendar days | All days including weekends and public holidays |

---

## Policy Configuration

### Updated Policy Sheet Structure

```csv
policy_name,leave_type,days_entitled,leave_days,minimum_employment_months,...
Annual Leave Entitlement,Annual,14,workday,6,...
Maternal Leave Entitlement,Maternal,90,calendarday,3,...
```

### Current Leave Types

| Leave Type | Days Entitled | Leave Days Type | Calculation Method |
|------------|---------------|-----------------|-------------------|
| Annual | 14 | **workday** | Mon-Fri only |
| Sick | 7 | **workday** | Mon-Fri only |
| Paternal | 5 | **workday** | Mon-Fri only |
| **Maternal** | **90** | **calendarday** | **All days** |
| Bereavement | 3 | **workday** | Mon-Fri only |
| Compassionate | 5 | **workday** | Mon-Fri only |

---

## How It Works

### Workday Calculation (Monday - Friday)

**Example 1: Full Week**
```
Request: Dec 1-5, 2025 (Mon-Fri)
Calendar days: 5
Calculation: 5 workdays (all weekdays)
Result: 5 days deducted from balance
```

**Example 2: With Weekend**
```
Request: Dec 1-7, 2025 (Mon-Sun)
Calendar days: 7
Calculation: 5 workdays (Mon-Fri, excludes Sat-Sun)
Result: 5 days deducted from balance
```

**Example 3: With Public Holiday**
```
Request: Dec 24-26, 2025 (Wed-Fri)
Public holiday: Dec 25 (Christmas)
Calendar days: 3
Calculation: 2 workdays (Dec 24, 26 only)
Result: 2 days deducted from balance
```

### Calendar Day Calculation (All Days)

**Example 1: Maternal Leave**
```
Request: Jan 1 - Mar 31, 2026
Calendar days: 90
Calculation: 90 calendar days (includes all days)
Result: 90 days total
Note: Includes weekends and public holidays
```

**Example 2: Maternal Leave with Weekends**
```
Request: 90 calendar days
Actual breakdown:
- Weekdays (Mon-Fri): ~65 days
- Weekends (Sat-Sun): ~25 days
- Total: 90 calendar days
Result: 90 days (we count ALL days)
```

---

## Code Implementation

### Policy Interface
```typescript
export interface Policy {
  policy_name: string;
  leave_type: string;
  days_entitled: number;
  leave_days: 'workday' | 'calendarday'; // NEW!
  minimum_employment_months: number;
  advance_notice_days: number;
  // ... other fields
}
```

### Validation Logic
```typescript
if (policy.leave_days === 'workday') {
  // Calculate Monday-Friday (exclude weekends & holidays)
  calculatedDays = calculateWeekdays(startDate, endDate, publicHolidays);
} else if (policy.leave_days === 'calendarday') {
  // Calculate all calendar days
  calculatedDays = calculateCalendarDays(startDate, endDate);
}
```

---

## Testing Examples

### Test Workday Calculation

**Annual Leave (14 workdays)**
```typescript
await submitLeaveRequest({
  email: 'kabir@curacel.ai',
  leave_type: 'Annual',
  start_date: '2025-12-01', // Monday
  end_date: '2025-12-05',   // Friday
  handover_document_link: 'https://docs.google.com/...',
});
// Expected: 5 workdays calculated
```

**With Weekend**
```typescript
await submitLeaveRequest({
  email: 'kabir@curacel.ai',
  leave_type: 'Annual',
  start_date: '2025-12-01', // Monday
  end_date: '2025-12-08',   // Monday (next week)
  handover_document_link: 'https://docs.google.com/...',
});
// Expected: 6 workdays (excludes Sat-Sun)
```

### Test Calendar Day Calculation

**Maternal Leave (90 calendar days)**
```typescript
await submitLeaveRequest({
  email: 'jane@curacel.ai',
  leave_type: 'Maternal',
  start_date: '2026-01-01',
  end_date: '2026-03-31', // 90 days later
  handover_document_link: 'https://docs.google.com/...',
});
// Expected: 90 calendar days (includes weekends & holidays)
```

---

## Adding New Leave Types

### Create a Workday Leave Type

```csv
Study Leave Entitlement,Study,10,workday,12,30,TRUE,TRUE,TRUE,TRUE,2025-11-17,ore@curacel.ai
```
- Will calculate Monday-Friday only
- Excludes weekends and public holidays

### Create a Calendar Day Leave Type

```csv
Sabbatical Leave Entitlement,Sabbatical,30,calendarday,36,60,TRUE,TRUE,TRUE,TRUE,2025-11-17,ore@curacel.ai
```
- Will count all calendar days
- Includes weekends and public holidays

---

## Differences Summary

| Aspect | workday | calendarday |
|--------|---------|-------------|
| **Weekends** | Excluded ❌ | Included ✅ |
| **Public Holidays** | Excluded ❌ | Included ✅ |
| **Calculation** | Only Mon-Fri | All days |
| **Example** | 5-day week = 5 days | 5-day week (Mon-Sun) = 7 days |
| **Use Cases** | Annual, Sick, Paternal | Maternal, Sabbatical |

---

## Migration Notes

### From `count_as_working_days` to `leave_days`

**Old Field** (removed):
```csv
count_as_working_days,TRUE
```

**New Field**:
```csv
leave_days,workday
```

**Mapping**:
- `count_as_working_days: TRUE` → `leave_days: workday`
- `count_as_working_days: FALSE` → `leave_days: calendarday`

### Why the Change?

The new `leave_days` field is:
- ✅ More explicit ("workday" vs "calendarday")
- ✅ Easier to understand
- ✅ Self-documenting
- ✅ Less prone to boolean confusion

---

## Validation Messages

### Workday Leave
```
"Leave request contains no valid working days (only weekends/public holidays)."
```
Shown when a workday leave request falls entirely on weekends/holidays.

### Calendar Day Leave
No such restriction - any date range is valid.

---

## FAQs

### Q: Can I mix workday and calendarday leave types?
**A:** Yes! Each leave type is independent. Annual can be workday while Maternal is calendarday.

### Q: What happens if I request 5 calendar days for Annual leave?
**A:** Since Annual is set to `workday`, the system calculates actual working days. If those 5 calendar days include a weekend, only 3-4 working days will be counted.

### Q: Can I change a leave type from workday to calendarday?
**A:** Yes, just update the `leave_days` column in the Policy CSV from `workday` to `calendarday`.

### Q: Does calendarday include public holidays?
**A:** Yes! Calendar day calculation includes **all** days - weekends AND public holidays.

### Q: Why is Maternal leave calendarday?
**A:** Maternal leave is typically a continuous period of time off, and it's standard practice globally to count all calendar days, not just working days. A 90-day maternity leave means 90 consecutive days.

---

## Summary

✅ **`leave_days` field added to Policy sheet**
✅ **Two clear options: workday | calendarday**
✅ **workday = Monday-Friday only**
✅ **calendarday = All days including weekends & holidays**
✅ **Maternal leave uses calendarday**
✅ **All other leave types use workday**
✅ **Easy to add new leave types with either option**

This makes the system flexible and clear about how different leave types are calculated!
