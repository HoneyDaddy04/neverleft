import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_PATH = join(__dirname, '../../../database');

export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  manager_id: string;
  hire_date: string;
  employment_status: string;
  annual_leave_balance: string;
  sick_leave_balance: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  request_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: string;
  reason: string;
  status: string;
  approver_id: string;
  submission_date: string;
  approval_date: string;
  rejection_reason: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  leave_type_id: string;
  leave_type_name: string;
  description: string;
  is_paid: string;
  requires_documentation: string;
  max_days_per_year: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  department_id: string;
  department_name: string;
  department_head_id: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  balance_id: string;
  employee_id: string;
  leave_type_id: string;
  year: string;
  total_allocated: string;
  used: string;
  remaining: string;
  carried_forward: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveApproval {
  approval_id: string;
  request_id: string;
  approver_id: string;
  approval_level: string;
  status: string;
  comments: string;
  action_date: string;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  holiday_id: string;
  holiday_name: string;
  holiday_date: string;
  is_recurring: string;
  description: string;
  created_at: string;
  updated_at: string;
}

class CSVService {
  private employees: Employee[] = [];
  private leaveRequests: LeaveRequest[] = [];
  private leaveTypes: LeaveType[] = [];
  private departments: Department[] = [];
  private leaveBalances: LeaveBalance[] = [];
  private leaveApprovals: LeaveApproval[] = [];
  private holidays: Holiday[] = [];

  constructor() {
    this.loadAllData();
  }

  private loadCSV<T>(filename: string): T[] {
    try {
      const filePath = join(DATABASE_PATH, filename);
      const fileContent = readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      return records as T[];
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return [];
    }
  }

  private loadAllData() {
    console.log('Loading CSV data from:', DATABASE_PATH);
    this.employees = this.loadCSV<Employee>('employees.csv');
    this.leaveRequests = this.loadCSV<LeaveRequest>('leave_requests.csv');
    this.leaveTypes = this.loadCSV<LeaveType>('leave_types.csv');
    this.departments = this.loadCSV<Department>('departments.csv');
    this.leaveBalances = this.loadCSV<LeaveBalance>('leave_balances.csv');
    this.leaveApprovals = this.loadCSV<LeaveApproval>('leave_approvals.csv');
    this.holidays = this.loadCSV<Holiday>('holidays.csv');

    console.log(`Loaded ${this.employees.length} employees`);
    console.log(`Loaded ${this.leaveRequests.length} leave requests`);
    console.log(`Loaded ${this.leaveTypes.length} leave types`);
    console.log(`Loaded ${this.departments.length} departments`);
    console.log(`Loaded ${this.leaveBalances.length} leave balances`);
    console.log(`Loaded ${this.leaveApprovals.length} leave approvals`);
    console.log(`Loaded ${this.holidays.length} holidays`);
  }

  // Employee methods
  getAllEmployees(): Employee[] {
    return this.employees;
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(emp => emp.employee_id === id);
  }

  getEmployeeByEmail(email: string): Employee | undefined {
    return this.employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
  }

  getEmployeesByDepartment(department: string): Employee[] {
    return this.employees.filter(emp => emp.department === department);
  }

  // Leave Request methods
  getAllLeaveRequests(): LeaveRequest[] {
    return this.leaveRequests;
  }

  getLeaveRequestById(id: string): LeaveRequest | undefined {
    return this.leaveRequests.find(req => req.request_id === id);
  }

  getLeaveRequestsByEmployee(employeeId: string): LeaveRequest[] {
    return this.leaveRequests.filter(req => req.employee_id === employeeId);
  }

  getLeaveRequestsByStatus(status: string): LeaveRequest[] {
    return this.leaveRequests.filter(req => req.status.toLowerCase() === status.toLowerCase());
  }

  // Leave Type methods
  getAllLeaveTypes(): LeaveType[] {
    return this.leaveTypes;
  }

  getLeaveTypeById(id: string): LeaveType | undefined {
    return this.leaveTypes.find(type => type.leave_type_id === id);
  }

  // Department methods
  getAllDepartments(): Department[] {
    return this.departments;
  }

  getDepartmentById(id: string): Department | undefined {
    return this.departments.find(dept => dept.department_id === id);
  }

  // Leave Balance methods
  getAllLeaveBalances(): LeaveBalance[] {
    return this.leaveBalances;
  }

  getLeaveBalancesByEmployee(employeeId: string): LeaveBalance[] {
    return this.leaveBalances.filter(bal => bal.employee_id === employeeId);
  }

  getLeaveBalanceByEmployeeAndType(employeeId: string, leaveTypeId: string, year?: string): LeaveBalance | undefined {
    const currentYear = year || new Date().getFullYear().toString();
    return this.leaveBalances.find(
      bal => bal.employee_id === employeeId &&
             bal.leave_type_id === leaveTypeId &&
             bal.year === currentYear
    );
  }

  // Leave Approval methods
  getAllLeaveApprovals(): LeaveApproval[] {
    return this.leaveApprovals;
  }

  getLeaveApprovalsByRequest(requestId: string): LeaveApproval[] {
    return this.leaveApprovals.filter(appr => appr.request_id === requestId);
  }

  // Holiday methods
  getAllHolidays(): Holiday[] {
    return this.holidays;
  }

  getHolidayById(id: string): Holiday | undefined {
    return this.holidays.find(hol => hol.holiday_id === id);
  }

  getHolidaysByYear(year: string): Holiday[] {
    return this.holidays.filter(hol => hol.holiday_date.startsWith(year));
  }

  // Reload data (useful for testing or periodic refresh)
  reload() {
    this.loadAllData();
  }
}

export const csvService = new CSVService();
