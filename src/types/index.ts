// User Roles - matches n8n workflow
export type UserRole = 'Employee' | 'TeamLead' | 'HR' | 'Admin' | 'Exec';

// Leave Types - matches n8n workflow
export type LeaveType = 'annual' | 'sick';

// Status values matching n8n workflow
export type RequestStatus = 'pending' | 'pending_hr' | 'approved' | 'declined' | 'hr_declined';
export type TLStatus = 'pending' | 'approved' | 'declined';
export type HRStatus = '' | 'approved' | 'declined';

// Task priorities and statuses for handovers
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'acknowledged' | 'in_progress' | 'completed';
export type NotificationType = 'approval' | 'rejection' | 'query' | 'handover' | 'reminder' | 'catchup' | 'query_response';

// Support Query categories for HR
export type QueryCategory = 'leave_policy' | 'benefits' | 'payroll' | 'general' | 'complaint' | 'other';

// Employee interface - matches Google Sheets employee table
export interface Employee {
  email: string;
  full_name: string;
  tl_email: string;
  tl_name: string;
  hr_email: string;
  employment_date: string;
  team: string;
  role: string;
  country: string;
  year: number;
  annual_entitlement: number;
  annual_taken: number;
  annual_balance: number;
  sick_entitlement: number;
  sick_taken: number;
  sick_balance: number;
  // App-specific fields
  user_role: UserRole;
  profile_image?: string;
}

// Leave Request interface - matches Google Sheets request table
export interface LeaveRequest {
  request_id: string;
  full_name: string;
  email: string;
  leave_type: LeaveType;
  request_date: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  days_before_request: number;
  handover_link: string;
  status: RequestStatus;
  // Team Lead fields
  tl_name: string;
  tl_email: string;
  tl_status: TLStatus;
  tl_decision_date: string;
  tl_comment: string;
  // HR fields
  hr_email: string;
  hr_status: HRStatus;
  hr_decision_date: string;
  hr_comment: string;
  // Balance snapshot at time of request
  annual_entitlement: number;
  annual_taken: number;
  annual_balance: number;
  sick_entitlement: number;
  sick_taken: number;
  sick_balance: number;
  timestamp: string;
}

// Handover Task interface
export interface HandoverTask {
  id: string;
  request_id: string;
  title: string;
  description: string;
  owner_email: string;
  owner_name: string;
  assignee_email: string;
  assignee_name: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  created_date: string;
  completed_date: string;
  comments?: TaskComment[];
}

// Task Comment interface
export interface TaskComment {
  id: string;
  task_id: string;
  author_email: string;
  author_name: string;
  content: string;
  created_at: string;
}

// Post-Leave Context Notes
export interface PostLeaveNote {
  id: string;
  request_id: string;
  employee_email: string;
  employee_name: string;
  content: string;
  created_at: string;
  created_by_email: string;
  created_by_name: string;
}

// Notification interface
export interface Notification {
  id: string;
  user_email: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  read: boolean;
  created_at: string;
  related_request_id?: string;
}

// Query interface for HR queries (on leave requests)
export interface Query {
  id: string;
  request_id: string;
  from_email: string;
  from_name: string;
  reason: string;
  message: string;
  response: string | null;
  responded_at: string | null;
  resolved: boolean;
  created_at: string;
}

// Support Query interface for employee queries to HR
export interface SupportQuery {
  id: string;
  from_email: string;
  from_name: string;
  category: QueryCategory;
  subject: string;
  message: string;
  response: string | null;
  responded_by_email: string | null;
  responded_by_name: string | null;
  responded_at: string | null;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

// User session (simplified for app auth)
export interface UserSession {
  email: string;
  employee: Employee;
  isAuthenticated: boolean;
}

// Dashboard stats
export interface DashboardStats {
  totalEmployees: number;
  pendingRequests: number;
  approvedThisMonth: number;
  onLeaveToday: number;
  teamCapacity: number;
}

// Team capacity for calendar view
export interface TeamCapacity {
  date: string;
  totalTeamMembers: number;
  onLeave: number;
  available: number;
  capacityPercentage: number;
  employeesOnLeave: Array<{
    email: string;
    name: string;
    leave_type: LeaveType;
  }>;
}

// Approval action payload
export interface ApprovalAction {
  request_id: string;
  action: 'approve' | 'decline';
  comment: string;
  actor_email: string;
  actor_name: string;
  actor_role: 'tl' | 'hr';
}
