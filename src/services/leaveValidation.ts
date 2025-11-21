import { csvDataService } from './csvDataService';

// Toggle between CSV and Google Sheets
const USE_CSV = true; // Set to false to use Google Sheets

export interface LeaveRequestInput {
  email: string;
  leave_type: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
  handover_document_link?: string;
}

export interface ValidationResult {
  validation_result: 'pass' | 'fail';
  reason?: string;
  calculated_days?: number;
  request_data?: {
    request_id: string;
    full_name: string;
    email: string;
    leave_type: string;
    request_date: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    handover_document_link: string;
    status: string;
    manager_email: string;
    manager_status: string;
    manager_decision_date: string;
    manager_comment: string;
    hr_status: string;
    hr_decision_date: string;
    hr_comment: string;
    timestamp: string;
    annual_taken: number;
    annual_balance: number;
    sick_taken: number;
    sick_balance: number;
  };
}

/**
 * Calculate calendar days between two dates (inclusive)
 * Used for leave types like Maternal leave (90 calendar days, not working days)
 */
export function calculateCalendarDays(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
  return diffDays;
}

/**
 * Calculate weekdays between two dates, excluding weekends and public holidays
 * Used for most leave types (Annual, Sick, Paternal, Bereavement, etc.)
 */
export function calculateWeekdays(
  startDate: Date,
  endDate: Date,
  publicHolidays: Date[] = []
): number {
  let count = 0;

  // Normalize dates to midnight UTC to avoid timezone issues
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const current = new Date(start);

  // Normalize public holiday dates to just date (no time)
  const holidayStrings = publicHolidays.map(d =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0]
  );

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const currentDateString = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate()
    ).toISOString().split('T')[0];

    // Check if it's a weekday (not Saturday=6 or Sunday=0) and not a public holiday
    const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
    const isHoliday = holidayStrings.includes(currentDateString);

    if (isWeekday && !isHoliday) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Parse DD/MM/YYYY date format (from CSV) to Date object
 */
export function parseDDMMYYYY(dateString: string): Date {
  if (!dateString) return new Date();

  // Check if it's already in YYYY-MM-DD format
  if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
    return new Date(dateString);
  }

  // Parse DD/MM/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  return new Date(dateString); // Fallback
}

/**
 * Calculate months worked from employment date
 */
export function getMonthsWorked(employmentDate: Date): number {
  const now = new Date();
  const months =
    (now.getFullYear() - employmentDate.getFullYear()) * 12 +
    (now.getMonth() - employmentDate.getMonth());
  return Math.max(0, months);
}

/**
 * Calculate days difference (for notice period checking)
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Main validation function - validates leave requests based on policy rules
 */
export async function validateLeaveRequest(
  input: LeaveRequestInput
): Promise<ValidationResult> {
  try {
    // Use CSV service
    const dataService = csvDataService;

    // Step 1: Identify employee
    const employee = await dataService.getEmployeeByEmail(input.email);

    if (!employee) {
      return {
        validation_result: 'fail',
        reason: `Employee with email ${input.email} not found in the system.`,
      };
    }

    // Step 2: Get policy for this leave type
    const policy = await dataService.getPolicyByLeaveType(input.leave_type);

    if (!policy) {
      return {
        validation_result: 'fail',
        reason: `Leave type "${input.leave_type}" is not recognized or is currently inactive.`,
      };
    }

    // Step 3: Parse and validate dates
    const startDate = new Date(input.start_date);
    const endDate = new Date(input.end_date);
    const requestDate = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        validation_result: 'fail',
        reason: 'Invalid date format. Please use YYYY-MM-DD format.',
      };
    }

    if (endDate < startDate) {
      return {
        validation_result: 'fail',
        reason: 'End date cannot be before start date.',
      };
    }

    // Step 4: Get public holidays for employee's country
    const year = startDate.getFullYear();
    const publicHolidays = await dataService.getPublicHolidays(
      employee.country,
      year
    );

    // Also get holidays for end date year if different
    if (endDate.getFullYear() !== year) {
      const nextYearHolidays = await dataService.getPublicHolidays(
        employee.country,
        endDate.getFullYear()
      );
      publicHolidays.push(...nextYearHolidays);
    }

    // Step 5: Calculate days based on policy (workday OR calendarday)
    let calculatedDays: number;

    if (policy.leave_days === 'workday') {
      // workday: Calculate working days Monday-Friday (exclude weekends & holidays)
      calculatedDays = calculateWeekdays(startDate, endDate, publicHolidays);

      if (calculatedDays === 0) {
        return {
          validation_result: 'fail',
          reason: 'Leave request contains no valid working days (only weekends/public holidays).',
        };
      }
    } else if (policy.leave_days === 'calendarday') {
      // calendarday: Calculate actual calendar days (includes weekends & holidays)
      calculatedDays = calculateCalendarDays(startDate, endDate);
    } else {
      // Fallback to workday if not specified
      calculatedDays = calculateWeekdays(startDate, endDate, publicHolidays);
    }

    // Step 6: Check employment duration requirement
    const employmentDate = parseDDMMYYYY(employee.employment_date);
    const monthsWorked = getMonthsWorked(employmentDate);

    if (monthsWorked < policy.minimum_employment_months) {
      return {
        validation_result: 'fail',
        reason: `You need at least ${policy.minimum_employment_months} months of employment for ${input.leave_type} leave. You have worked ${monthsWorked} months.`,
      };
    }

    // Step 7: Check advance notice requirement
    const daysUntilLeave = getDaysDifference(requestDate, startDate);

    // Special rule: Sick leave should not be more than 3 days in the future
    if (input.leave_type.toLowerCase() === 'sick') {
      if (startDate > requestDate && daysUntilLeave > 3) {
        return {
          validation_result: 'fail',
          reason: 'Sick leave cannot be requested more than 3 days in advance. Sick leave is for current or recent illness.',
        };
      }
    } else {
      // For other leave types, check advance notice requirement
      if (startDate > requestDate && daysUntilLeave < policy.advance_notice_days) {
        return {
          validation_result: 'fail',
          reason: `${input.leave_type} leave requires at least ${policy.advance_notice_days} days advance notice. You provided ${daysUntilLeave} days.`,
        };
      }
    }

    // Step 8: Check leave balance
    let currentTaken = 0;
    let entitlement = 0;
    let remainingBalance = 0;

    if (input.leave_type.toLowerCase() === 'annual') {
      currentTaken = employee.annual_taken || 0;
      entitlement = employee.annual_entitlement || policy.days_entitled;
      remainingBalance = entitlement - currentTaken;
    } else if (input.leave_type.toLowerCase() === 'sick') {
      currentTaken = employee.sick_taken || 0;
      entitlement = employee.sick_entitlement || policy.days_entitled;
      remainingBalance = entitlement - currentTaken;
    } else {
      // For other leave types (paternal, maternal, etc.), use policy entitlement
      // These are typically separate from annual/sick balances
      entitlement = policy.days_entitled;
      remainingBalance = entitlement; // Assume full entitlement available
    }

    if (calculatedDays > remainingBalance) {
      return {
        validation_result: 'fail',
        reason: `Insufficient leave balance. You requested ${calculatedDays} days but only have ${remainingBalance} days remaining.`,
      };
    }

    // Step 9: Check handover requirement
    if (policy.requires_handover) {
      if (!input.handover_document_link || input.handover_document_link.trim() === '') {
        return {
          validation_result: 'fail',
          reason: `Handover document is required for ${input.leave_type} leave.`,
        };
      }
    }

    // Step 10: Determine status and approval routing
    let status = 'Pending Manager Approval';
    let manager_status = 'Pending';
    let hr_status = 'Pending';

    // Sick leave is auto-approved
    if (input.leave_type.toLowerCase() === 'sick') {
      status = 'Auto-Approved';
      manager_status = 'N/A';
      hr_status = 'N/A';
    } else {
      // Other leave types require manager approval first
      if (!policy.requires_manager_approval) {
        manager_status = 'N/A';
        status = 'Pending HR Approval';
      }

      if (!policy.requires_hr_approval) {
        hr_status = 'N/A';
      }
    }

    // Step 11: Calculate updated balances
    const newAnnualTaken = input.leave_type.toLowerCase() === 'annual'
      ? currentTaken + calculatedDays
      : employee.annual_taken || 0;
    const newSickTaken = input.leave_type.toLowerCase() === 'sick'
      ? currentTaken + calculatedDays
      : employee.sick_taken || 0;

    const annualBalance = (employee.annual_entitlement || 14) - newAnnualTaken;
    const sickBalance = (employee.sick_entitlement || 7) - newSickTaken;

    // Step 12: Build request data for Requests sheet
    const request_id = Date.now().toString();
    const timestamp = new Date().toISOString();

    const requestData = {
      request_id,
      full_name: employee.full_name,
      email: employee.email,
      leave_type: input.leave_type,
      request_date: requestDate.toISOString().split('T')[0],
      start_date: input.start_date,
      end_date: input.end_date,
      days_requested: calculatedDays,
      handover_document_link: input.handover_document_link || '',
      status,
      manager_email: employee.manager_email || '',
      manager_status,
      manager_decision_date: '',
      manager_comment: '',
      hr_status,
      hr_decision_date: '',
      hr_comment: '',
      timestamp,
      annual_taken: newAnnualTaken,
      annual_balance: annualBalance,
      sick_taken: newSickTaken,
      sick_balance: sickBalance,
    };

    // VALIDATION PASSED
    return {
      validation_result: 'pass',
      calculated_days: calculatedDays,
      request_data: requestData,
    };

  } catch (error: any) {
    console.error('Validation error:', error);
    return {
      validation_result: 'fail',
      reason: `System error: ${error.message}`,
    };
  }
}

/**
 * Submit a validated leave request to CSV data store
 */
export async function submitLeaveRequest(
  input: LeaveRequestInput
): Promise<{ success: boolean; message: string; request_id?: string }> {
  // Use CSV service
  const dataService = csvDataService;

  // First validate
  const validationResult = await validateLeaveRequest(input);

  if (validationResult.validation_result === 'fail') {
    return {
      success: false,
      message: validationResult.reason || 'Validation failed',
    };
  }

  // If validation passed, create the request
  const result = await dataService.createRequest(
    validationResult.request_data!
  );

  if (!result.success) {
    return {
      success: false,
      message: 'Failed to create leave request',
    };
  }

  // Update employee leave balance if it's annual or sick leave
  if (input.leave_type.toLowerCase() === 'annual' || input.leave_type.toLowerCase() === 'sick') {
    const leaveType = input.leave_type.toLowerCase() as 'annual' | 'sick';
    const fieldName = leaveType === 'annual' ? 'annual_taken' : 'sick_taken';
    const newTaken = validationResult.request_data![fieldName];

    await dataService.updateEmployee(input.email, {
      [fieldName]: newTaken,
    } as any);
  }

  return {
    success: true,
    message: validationResult.request_data!.status === 'Auto-Approved'
      ? 'Sick leave request auto-approved successfully!'
      : 'Leave request submitted successfully and pending approval.',
    request_id: result.request_id,
  };
}
