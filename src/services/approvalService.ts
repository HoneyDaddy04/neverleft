import { csvDataService, LeaveRequest, Policy } from './csvDataService';

export interface ApprovalResult {
  success: boolean;
  message: string;
  nextStep?: 'hr_approval' | 'complete' | 'rejected';
  updatedRequest?: LeaveRequest;
}

/**
 * Approval Service
 * Centralized service for managing leave request approval workflows
 */
export const approvalService = {
  /**
   * Manager approves a leave request
   * - Updates manager status to Approved
   * - Routes to HR if policy requires HR approval
   * - Updates employee balance if no HR approval needed
   */
  async managerApprove(
    requestId: string,
    managerEmail: string,
    comments: string = ''
  ): Promise<ApprovalResult> {
    try {
      // Get the request
      const requests = await csvDataService.getRequests();
      const request = requests.find(r => r.request_id === requestId);

      if (!request) {
        return {
          success: false,
          message: 'Request not found',
        };
      }

      // Verify manager is authorized
      if (request.manager_email !== managerEmail) {
        return {
          success: false,
          message: 'Unauthorized: You are not the manager for this employee',
        };
      }

      // Get the policy to check if HR approval is required
      const policy = await csvDataService.getPolicyByLeaveType(request.leave_type);

      if (!policy) {
        return {
          success: false,
          message: 'Policy not found for this leave type',
        };
      }

      let updates: any = {
        manager_status: 'Approved',
        manager_comments: comments,
        manager_approved_date: new Date().toISOString().split('T')[0],
      };

      let nextStep: 'hr_approval' | 'complete' = 'complete';

      // Check if HR approval is required
      if (policy.requires_hr_approval) {
        // Route to HR for next approval
        updates.hr_status = 'Pending';
        updates.status = 'Pending'; // Overall status remains pending
        nextStep = 'hr_approval';
      } else {
        // No HR approval needed - this is final approval
        updates.status = 'Approved';
        nextStep = 'complete';

        // Update employee balance
        await this.updateEmployeeBalance(request);
      }

      const success = await csvDataService.updateRequest(requestId, updates);

      if (!success) {
        return {
          success: false,
          message: 'Failed to update request',
        };
      }

      return {
        success: true,
        message: nextStep === 'hr_approval'
          ? 'Request approved and sent to HR for final approval'
          : 'Request approved successfully',
        nextStep,
      };
    } catch (error) {
      console.error('Manager approval error:', error);
      return {
        success: false,
        message: 'An error occurred during approval',
      };
    }
  },

  /**
   * Manager rejects a leave request
   * - Updates manager status to Rejected
   * - Sets overall status to Rejected (final)
   */
  async managerReject(
    requestId: string,
    managerEmail: string,
    comments: string
  ): Promise<ApprovalResult> {
    try {
      // Get the request
      const requests = await csvDataService.getRequests();
      const request = requests.find(r => r.request_id === requestId);

      if (!request) {
        return {
          success: false,
          message: 'Request not found',
        };
      }

      // Verify manager is authorized
      if (request.manager_email !== managerEmail) {
        return {
          success: false,
          message: 'Unauthorized: You are not the manager for this employee',
        };
      }

      if (!comments || comments.trim() === '') {
        return {
          success: false,
          message: 'Comments are required for rejection',
        };
      }

      const updates = {
        manager_status: 'Rejected',
        manager_comments: comments,
        status: 'Rejected', // Final rejection
        manager_approved_date: new Date().toISOString().split('T')[0],
      };

      const success = await csvDataService.updateRequest(requestId, updates);

      if (!success) {
        return {
          success: false,
          message: 'Failed to update request',
        };
      }

      return {
        success: true,
        message: 'Request rejected',
        nextStep: 'rejected',
      };
    } catch (error) {
      console.error('Manager rejection error:', error);
      return {
        success: false,
        message: 'An error occurred during rejection',
      };
    }
  },

  /**
   * HR approves a leave request (final approval)
   * - Updates HR status to Approved
   * - Sets overall status to Approved
   * - Updates employee balance
   */
  async hrApprove(
    requestId: string,
    hrEmail: string,
    comments: string = ''
  ): Promise<ApprovalResult> {
    try {
      // Get the request
      const requests = await csvDataService.getRequests();
      const request = requests.find(r => r.request_id === requestId);

      if (!request) {
        return {
          success: false,
          message: 'Request not found',
        };
      }

      // Check if manager has approved first
      if (request.manager_status !== 'Approved') {
        return {
          success: false,
          message: 'Manager approval is required before HR approval',
        };
      }

      const updates = {
        hr_status: 'Approved',
        hr_comments: comments,
        status: 'Approved', // Final status
        hr_approved_date: new Date().toISOString().split('T')[0],
      };

      const success = await csvDataService.updateRequest(requestId, updates);

      if (!success) {
        return {
          success: false,
          message: 'Failed to update request',
        };
      }

      // Update employee balance
      await this.updateEmployeeBalance(request);

      return {
        success: true,
        message: 'Request approved successfully',
        nextStep: 'complete',
      };
    } catch (error) {
      console.error('HR approval error:', error);
      return {
        success: false,
        message: 'An error occurred during approval',
      };
    }
  },

  /**
   * HR rejects a leave request (final rejection)
   * - Updates HR status to Rejected
   * - Sets overall status to Rejected
   */
  async hrReject(
    requestId: string,
    hrEmail: string,
    comments: string
  ): Promise<ApprovalResult> {
    try {
      // Get the request
      const requests = await csvDataService.getRequests();
      const request = requests.find(r => r.request_id === requestId);

      if (!request) {
        return {
          success: false,
          message: 'Request not found',
        };
      }

      if (!comments || comments.trim() === '') {
        return {
          success: false,
          message: 'Comments are required for rejection',
        };
      }

      const updates = {
        hr_status: 'Rejected',
        hr_comments: comments,
        status: 'Rejected', // Final status
        hr_approved_date: new Date().toISOString().split('T')[0],
      };

      const success = await csvDataService.updateRequest(requestId, updates);

      if (!success) {
        return {
          success: false,
          message: 'Failed to update request',
        };
      }

      return {
        success: true,
        message: 'Request rejected',
        nextStep: 'rejected',
      };
    } catch (error) {
      console.error('HR rejection error:', error);
      return {
        success: false,
        message: 'An error occurred during rejection',
      };
    }
  },

  /**
   * Update employee leave balance after approval
   * - Deducts days from appropriate balance (annual_taken or sick_taken)
   */
  async updateEmployeeBalance(request: LeaveRequest): Promise<boolean> {
    try {
      const employee = await csvDataService.getEmployeeByEmail(request.employee_email);

      if (!employee) {
        console.error('Employee not found:', request.employee_email);
        return false;
      }

      let balanceField: 'annual_taken' | 'sick_taken' | null = null;

      switch (request.leave_type) {
        case 'Annual':
          balanceField = 'annual_taken';
          break;
        case 'Sick':
          balanceField = 'sick_taken';
          break;
        // Add other leave types as needed
        default:
          console.warn('No balance field mapped for leave type:', request.leave_type);
          return true; // Not an error, just no balance update needed
      }

      if (balanceField) {
        const newTaken = (employee[balanceField] || 0) + request.days_requested;
        await csvDataService.updateEmployee(request.employee_email, {
          [balanceField]: newTaken,
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating employee balance:', error);
      return false;
    }
  },

  /**
   * Get pending requests for a manager
   */
  async getManagerPendingRequests(managerEmail: string): Promise<LeaveRequest[]> {
    try {
      const allRequests = await csvDataService.getRequests();
      return allRequests.filter(
        r => r.manager_email === managerEmail && r.manager_status === 'Pending'
      );
    } catch (error) {
      console.error('Error fetching manager pending requests:', error);
      return [];
    }
  },

  /**
   * Get pending requests for HR
   */
  async getHRPendingRequests(): Promise<LeaveRequest[]> {
    try {
      const allRequests = await csvDataService.getRequests();
      return allRequests.filter(r => r.hr_status === 'Pending');
    } catch (error) {
      console.error('Error fetching HR pending requests:', error);
      return [];
    }
  },

  /**
   * Auto-approve sick leave (if configured in policy)
   * Sick leave can be auto-approved without manager/HR approval
   */
  async autoApproveSickLeave(requestId: string): Promise<ApprovalResult> {
    try {
      const requests = await csvDataService.getRequests();
      const request = requests.find(r => r.request_id === requestId);

      if (!request) {
        return {
          success: false,
          message: 'Request not found',
        };
      }

      if (request.leave_type !== 'Sick') {
        return {
          success: false,
          message: 'Only sick leave can be auto-approved',
        };
      }

      const policy = await csvDataService.getPolicyByLeaveType('Sick');

      // Check if policy allows auto-approval (no manager/HR approval required)
      if (policy && !policy.requires_manager_approval && !policy.requires_hr_approval) {
        const updates = {
          manager_status: 'Approved',
          hr_status: 'Approved',
          status: 'Approved',
          manager_comments: 'Auto-approved (sick leave)',
          hr_comments: 'Auto-approved (sick leave)',
          manager_approved_date: new Date().toISOString().split('T')[0],
          hr_approved_date: new Date().toISOString().split('T')[0],
        };

        const success = await csvDataService.updateRequest(requestId, updates);

        if (success) {
          await this.updateEmployeeBalance(request);
          return {
            success: true,
            message: 'Sick leave auto-approved',
            nextStep: 'complete',
          };
        }
      }

      return {
        success: false,
        message: 'Auto-approval not configured for sick leave',
      };
    } catch (error) {
      console.error('Auto-approval error:', error);
      return {
        success: false,
        message: 'An error occurred during auto-approval',
      };
    }
  },
};
