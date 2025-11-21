import Papa from 'papaparse';

// Interface definitions
export interface Employee {
  email: string;
  full_name: string;
  manager_email: string;
  manager_name: string;
  employment_date: string;
  Current: string; // year
  team: string;
  role: string;
  country: string;
  annual_entitlement: number;
  annual_taken: number;
  sick_entitlement: number;
  sick_taken: number;
}

export interface Policy {
  policy_name: string;
  leave_type: string;
  days_entitled: number;
  leave_days: 'workday' | 'calendarday'; // NEW FIELD: workday = Mon-Fri, calendarday = all days
  minimum_employment_months: number;
  advance_notice_days: number;
  requires_manager_approval: boolean;
  requires_hr_approval: boolean;
  requires_handover: boolean;
  active: boolean;
  last_updated: string;
  updated_by: string;
}

export interface PublicHoliday {
  country: string;
  holiday_name: string;
  holiday_date: string;
  year: number;
  is_active: boolean;
}

export interface LeaveRequest {
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
}

// In-memory data storage
let employeesData: Employee[] = [];
let policiesData: Policy[] = [];
let holidaysData: PublicHoliday[] = [];
let requestsData: LeaveRequest[] = [];

class CSVDataService {
  private initialized: boolean = false;

  /**
   * Load CSV file from public folder
   */
  private async loadCSV<T>(filename: string): Promise<T[]> {
    try {
      const response = await fetch(`/sample-data/${filename}`);
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // Converts numbers and booleans automatically
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            resolve(results.data as T[]);
          },
          error: (error) => {
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
      return [];
    }
  }

  /**
   * Initialize - Load all CSV files into memory
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Loading CSV data...');

    try {
      [employeesData, policiesData, holidaysData, requestsData] = await Promise.all([
        this.loadCSV<Employee>('employees-template.csv'),
        this.loadCSV<Policy>('policy-template.csv'),
        this.loadCSV<PublicHoliday>('public-holidays-template.csv'),
        this.loadCSV<LeaveRequest>('requests-template.csv'),
      ]);

      // Parse boolean fields that might come as strings
      policiesData = policiesData.map((p) => ({
        ...p,
        requires_manager_approval: this.parseBoolean(p.requires_manager_approval),
        requires_hr_approval: this.parseBoolean(p.requires_hr_approval),
        requires_handover: this.parseBoolean(p.requires_handover),
        active: this.parseBoolean(p.active),
        // Ensure leave_days is lowercase
        leave_days: (p.leave_days as string)?.toLowerCase() as 'workday' | 'calendarday',
      }));

      holidaysData = holidaysData.map((h) => ({
        ...h,
        is_active: this.parseBoolean(h.is_active),
      }));

      this.initialized = true;
      console.log('CSV data loaded successfully:', {
        employees: employeesData.length,
        policies: policiesData.length,
        holidays: holidaysData.length,
        requests: requestsData.length,
      });
    } catch (error) {
      console.error('Failed to initialize CSV data:', error);
    }
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toUpperCase() === 'TRUE';
    }
    return false;
  }

  // ==================== EMPLOYEES ====================

  async getEmployees(): Promise<Employee[]> {
    await this.initialize();
    return [...employeesData]; // Return a copy
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    await this.initialize();
    const employee = employeesData.find((emp) => emp.email.toLowerCase() === email.toLowerCase());
    return employee ? { ...employee } : null;
  }

  async updateEmployee(email: string, updates: Partial<Employee>): Promise<boolean> {
    await this.initialize();
    const index = employeesData.findIndex((emp) => emp.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return false;

    employeesData[index] = { ...employeesData[index], ...updates };
    console.log('Employee updated:', employeesData[index]);
    return true;
  }

  async createEmployee(employee: Employee): Promise<boolean> {
    await this.initialize();
    // Check if employee already exists
    const exists = employeesData.some((emp) => emp.email.toLowerCase() === employee.email.toLowerCase());
    if (exists) {
      console.error('Employee already exists:', employee.email);
      return false;
    }

    employeesData.push(employee);
    console.log('Employee created:', employee);
    return true;
  }

  async deleteEmployee(email: string): Promise<boolean> {
    await this.initialize();
    const index = employeesData.findIndex((emp) => emp.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return false;

    employeesData.splice(index, 1);
    console.log('Employee deleted:', email);
    return true;
  }

  // ==================== POLICIES ====================

  async getPolicies(): Promise<Policy[]> {
    await this.initialize();
    return [...policiesData];
  }

  async getPolicyByLeaveType(leaveType: string): Promise<Policy | null> {
    await this.initialize();
    const policy = policiesData.find(
      (p) => p.leave_type.toLowerCase() === leaveType.toLowerCase() && p.active
    );
    return policy ? { ...policy } : null;
  }

  async updatePolicy(leaveType: string, updates: Partial<Policy>): Promise<boolean> {
    await this.initialize();
    const index = policiesData.findIndex((p) => p.leave_type.toLowerCase() === leaveType.toLowerCase());
    if (index === -1) return false;

    policiesData[index] = { ...policiesData[index], ...updates };
    console.log('Policy updated:', policiesData[index]);
    return true;
  }

  async createPolicy(policy: Policy): Promise<boolean> {
    await this.initialize();
    const exists = policiesData.some((p) => p.leave_type.toLowerCase() === policy.leave_type.toLowerCase());
    if (exists) {
      console.error('Policy already exists for leave type:', policy.leave_type);
      return false;
    }

    policiesData.push(policy);
    console.log('Policy created:', policy);
    return true;
  }

  async deletePolicy(leaveType: string): Promise<boolean> {
    await this.initialize();
    const index = policiesData.findIndex((p) => p.leave_type.toLowerCase() === leaveType.toLowerCase());
    if (index === -1) return false;

    policiesData.splice(index, 1);
    console.log('Policy deleted:', leaveType);
    return true;
  }

  // ==================== PUBLIC HOLIDAYS ====================

  async getPublicHolidays(country: string, year: number): Promise<Date[]> {
    await this.initialize();
    return holidaysData
      .filter((h) => h.country === country && h.year === year && h.is_active)
      .map((h) => new Date(h.holiday_date));
  }

  async getAllHolidays(): Promise<PublicHoliday[]> {
    await this.initialize();
    return [...holidaysData];
  }

  async createHoliday(holiday: PublicHoliday): Promise<boolean> {
    await this.initialize();
    holidaysData.push(holiday);
    console.log('Holiday created:', holiday);
    return true;
  }

  async deleteHoliday(country: string, holidayDate: string): Promise<boolean> {
    await this.initialize();
    const index = holidaysData.findIndex(
      (h) => h.country === country && h.holiday_date === holidayDate
    );
    if (index === -1) return false;

    holidaysData.splice(index, 1);
    console.log('Holiday deleted:', { country, holidayDate });
    return true;
  }

  // ==================== LEAVE REQUESTS ====================

  async getRequests(): Promise<LeaveRequest[]> {
    await this.initialize();
    return [...requestsData];
  }

  async getRequestById(requestId: string): Promise<LeaveRequest | null> {
    await this.initialize();
    const request = requestsData.find((r) => r.request_id === requestId);
    return request ? { ...request } : null;
  }

  async getRequestsByEmail(email: string): Promise<LeaveRequest[]> {
    await this.initialize();
    return requestsData.filter((r) => r.email.toLowerCase() === email.toLowerCase());
  }

  async getRequestsByManager(managerEmail: string): Promise<LeaveRequest[]> {
    await this.initialize();
    return requestsData.filter((r) => r.manager_email.toLowerCase() === managerEmail.toLowerCase());
  }

  async getPendingHRRequests(): Promise<LeaveRequest[]> {
    await this.initialize();
    return requestsData.filter(
      (r) => r.manager_status === 'Approved' && r.hr_status === 'Pending'
    );
  }

  async createRequest(request: LeaveRequest): Promise<{ success: boolean; request_id?: string }> {
    await this.initialize();
    requestsData.push(request);
    console.log('Leave request created:', request);
    return { success: true, request_id: request.request_id };
  }

  async updateRequest(requestId: string, updates: Partial<LeaveRequest>): Promise<boolean> {
    await this.initialize();
    const index = requestsData.findIndex((r) => r.request_id === requestId);
    if (index === -1) return false;

    requestsData[index] = { ...requestsData[index], ...updates };
    console.log('Request updated:', requestsData[index]);
    return true;
  }

  async deleteRequest(requestId: string): Promise<boolean> {
    await this.initialize();
    const index = requestsData.findIndex((r) => r.request_id === requestId);
    if (index === -1) return false;

    requestsData.splice(index, 1);
    console.log('Request deleted:', requestId);
    return true;
  }

  // ==================== EXPORT DATA ====================

  /**
   * Export current data to CSV format (for downloading/saving)
   */
  exportToCSV(dataType: 'employees' | 'policies' | 'holidays' | 'requests'): string {
    let data: any[] = [];

    switch (dataType) {
      case 'employees':
        data = employeesData;
        break;
      case 'policies':
        data = policiesData;
        break;
      case 'holidays':
        data = holidaysData;
        break;
      case 'requests':
        data = requestsData;
        break;
    }

    return Papa.unparse(data);
  }

  /**
   * Download CSV file
   */
  downloadCSV(dataType: 'employees' | 'policies' | 'holidays' | 'requests', filename: string) {
    const csv = this.exportToCSV(dataType);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Export singleton instance
export const csvDataService = new CSVDataService();
