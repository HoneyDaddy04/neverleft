import { google } from 'googleapis';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

// For development/demo mode, we'll use a flag
const USE_DEMO_MODE = !SPREADSHEET_ID || SPREADSHEET_ID === 'demo';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  credentials: any;
}

class GoogleSheetsService {
  private sheets: any;
  private auth: any;
  private initialized: boolean = false;

  async initialize(config?: GoogleSheetsConfig) {
    if (USE_DEMO_MODE) {
      console.log('Running in DEMO mode - Google Sheets integration disabled');
      this.initialized = false;
      return;
    }

    try {
      // In a real implementation, credentials would come from a secure backend
      // For now, we'll handle this in the backend service
      const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json', // This will be handled by backend
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.auth = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      console.log('Google Sheets service initialized');
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      this.initialized = false;
    }
  }

  private ensureInitialized() {
    if (!this.initialized && !USE_DEMO_MODE) {
      throw new Error('Google Sheets service not initialized. Call initialize() first.');
    }
  }

  async getEmployees(): Promise<any[]> {
    if (USE_DEMO_MODE) {
      // Return demo data
      const { DEMO_USERS } = await import('@/lib/mockData');
      return DEMO_USERS;
    }

    this.ensureInitialized();

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Employees!A2:M', // Skip header row
    });

    const rows = response.data.values || [];
    return rows.map((row: any[]) => ({
      email: row[0],
      full_name: row[1],
      manager_email: row[2],
      manager_name: row[3],
      employment_date: row[4],
      annual_entitlement: parseInt(row[5]) || 0,
      annual_taken: parseInt(row[6]) || 0,
      sick_entitlement: parseInt(row[7]) || 0,
      sick_taken: parseInt(row[8]) || 0,
      year: parseInt(row[9]) || new Date().getFullYear(),
      team: row[10],
      role: row[11],
      country: row[12],
    }));
  }

  async getEmployeeByEmail(email: string): Promise<any | null> {
    const employees = await this.getEmployees();
    return employees.find((emp) => emp.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getPolicies(): Promise<any[]> {
    if (USE_DEMO_MODE) {
      // Return demo policies
      return [
        {
          policy_name: 'Annual Leave Entitlement',
          leave_type: 'Annual',
          days_entitled: 14,
          minimum_employment_months: 6,
          advance_notice_days: 7,
          requires_manager_approval: true,
          requires_hr_approval: true,
          requires_handover: true,
          active: true,
        },
        {
          policy_name: 'Sick Leave Entitlement',
          leave_type: 'Sick',
          days_entitled: 7,
          minimum_employment_months: 0,
          advance_notice_days: 0,
          requires_manager_approval: false,
          requires_hr_approval: false,
          requires_handover: false,
          active: true,
        },
        {
          policy_name: 'Paternal Leave Entitlement',
          leave_type: 'Paternal',
          days_entitled: 5,
          minimum_employment_months: 0,
          advance_notice_days: 30,
          requires_manager_approval: true,
          requires_hr_approval: true,
          requires_handover: true,
          active: true,
        },
        {
          policy_name: 'Maternal Leave Entitlement',
          leave_type: 'Maternal',
          days_entitled: 90,
          minimum_employment_months: 6,
          advance_notice_days: 60,
          requires_manager_approval: true,
          requires_hr_approval: true,
          requires_handover: true,
          active: true,
        },
      ];
    }

    this.ensureInitialized();

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Policy!A2:K',
    });

    const rows = response.data.values || [];
    return rows.map((row: any[]) => ({
      policy_name: row[0],
      leave_type: row[1],
      days_entitled: parseInt(row[2]) || 0,
      minimum_employment_months: parseInt(row[3]) || 0,
      advance_notice_days: parseInt(row[4]) || 0,
      requires_manager_approval: row[5] === 'TRUE',
      requires_hr_approval: row[6] === 'TRUE',
      requires_handover: row[7] === 'TRUE',
      active: row[8] === 'TRUE',
      last_updated: row[9],
      updated_by: row[10],
    }));
  }

  async getPolicyByLeaveType(leaveType: string): Promise<any | null> {
    const policies = await this.getPolicies();
    return policies.find(
      (policy) => policy.leave_type.toLowerCase() === leaveType.toLowerCase() && policy.active
    ) || null;
  }

  async getPublicHolidays(country: string, year: number): Promise<Date[]> {
    if (USE_DEMO_MODE) {
      // Return some demo holidays for Nigeria 2025
      if (country === 'Nigeria' && year === 2025) {
        return [
          new Date('2025-01-01'), // New Year
          new Date('2025-04-18'), // Good Friday
          new Date('2025-04-21'), // Easter Monday
          new Date('2025-05-01'), // Workers' Day
          new Date('2025-12-25'), // Christmas
          new Date('2025-12-26'), // Boxing Day
        ];
      }
      return [];
    }

    this.ensureInitialized();

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'PublicHolidays!A2:E',
    });

    const rows = response.data.values || [];
    return rows
      .filter((row: any[]) => {
        return (
          row[0] === country &&
          parseInt(row[3]) === year &&
          row[4] === 'TRUE'
        );
      })
      .map((row: any[]) => new Date(row[2]));
  }

  async createLeaveRequest(requestData: any): Promise<{ success: boolean; request_id?: string; error?: string }> {
    if (USE_DEMO_MODE) {
      console.log('Demo mode: Would create request', requestData);
      return { success: true, request_id: Date.now().toString() };
    }

    this.ensureInitialized();

    const request_id = Date.now().toString();
    const timestamp = new Date().toISOString();

    const row = [
      request_id,
      requestData.full_name,
      requestData.email,
      requestData.leave_type,
      requestData.request_date,
      requestData.start_date,
      requestData.end_date,
      requestData.days_requested,
      requestData.handover_document_link || '',
      requestData.status,
      requestData.manager_email || '',
      requestData.manager_status || '',
      requestData.manager_decision_date || '',
      requestData.manager_comment || '',
      requestData.hr_status || '',
      requestData.hr_decision_date || '',
      requestData.hr_comment || '',
      timestamp,
      requestData.annual_taken,
      requestData.annual_balance,
      requestData.sick_taken,
      requestData.sick_balance,
    ];

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Requests!A:V',
        valueInputOption: 'RAW',
        resource: {
          values: [row],
        },
      });

      return { success: true, request_id };
    } catch (error: any) {
      console.error('Failed to create leave request:', error);
      return { success: false, error: error.message };
    }
  }

  async updateEmployeeLeaveBalance(
    email: string,
    leaveType: 'annual' | 'sick',
    newTaken: number
  ): Promise<boolean> {
    if (USE_DEMO_MODE) {
      console.log('Demo mode: Would update balance', { email, leaveType, newTaken });
      return true;
    }

    this.ensureInitialized();

    try {
      // First, find the employee row
      const employees = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Employees!A2:M',
      });

      const rows = employees.data.values || [];
      const rowIndex = rows.findIndex((row: any[]) => row[0].toLowerCase() === email.toLowerCase());

      if (rowIndex === -1) {
        console.error('Employee not found:', email);
        return false;
      }

      // Update the appropriate column (column G for annual_taken, column I for sick_taken)
      const columnLetter = leaveType === 'annual' ? 'G' : 'I';
      const actualRowNumber = rowIndex + 2; // +2 because: arrays are 0-indexed, and we skip header row

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Employees!${columnLetter}${actualRowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[newTaken]],
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to update employee leave balance:', error);
      return false;
    }
  }

  async getRequests(): Promise<any[]> {
    if (USE_DEMO_MODE) {
      const { DEMO_LEAVE_REQUESTS } = await import('@/lib/mockData');
      return DEMO_LEAVE_REQUESTS;
    }

    this.ensureInitialized();

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Requests!A2:V',
    });

    const rows = response.data.values || [];
    return rows.map((row: any[]) => ({
      request_id: row[0],
      full_name: row[1],
      email: row[2],
      leave_type: row[3],
      request_date: row[4],
      start_date: row[5],
      end_date: row[6],
      days_requested: parseInt(row[7]) || 0,
      handover_document_link: row[8],
      status: row[9],
      manager_email: row[10],
      manager_status: row[11],
      manager_decision_date: row[12],
      manager_comment: row[13],
      hr_status: row[14],
      hr_decision_date: row[15],
      hr_comment: row[16],
      timestamp: row[17],
      annual_taken: parseInt(row[18]) || 0,
      annual_balance: parseInt(row[19]) || 0,
      sick_taken: parseInt(row[20]) || 0,
      sick_balance: parseInt(row[21]) || 0,
    }));
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();
