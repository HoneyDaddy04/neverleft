import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  LeaveRequest,
  HandoverTask,
  PostLeaveNote,
  Notification,
  Employee,
  ApprovalAction,
  RequestStatus,
  SupportQuery,
  QueryCategory,
} from '@/types';
import {
  LEAVE_REQUESTS,
  HANDOVER_TASKS,
  POST_LEAVE_NOTES,
  NOTIFICATIONS,
  EMPLOYEES,
  SUPPORT_QUERIES,
  calculateWorkingDays,
  getEmployeeByEmail,
} from '@/lib/mockData';

interface DataContextType {
  // Leave Requests
  leaveRequests: LeaveRequest[];
  getMyRequests: (email: string) => LeaveRequest[];
  getTeamRequests: (tlEmail: string) => LeaveRequest[];
  getPendingTLApprovals: (tlEmail: string) => LeaveRequest[];
  getPendingHRApprovals: () => LeaveRequest[];
  getAllRequests: () => LeaveRequest[];
  getRequestById: (id: string) => LeaveRequest | undefined;
  createLeaveRequest: (request: Omit<LeaveRequest, 'request_id' | 'timestamp' | 'status' | 'tl_status' | 'hr_status' | 'tl_decision_date' | 'hr_decision_date' | 'tl_comment' | 'hr_comment' | 'request_date'>) => LeaveRequest;
  processApproval: (action: ApprovalAction) => void;

  // Handover Tasks
  handoverTasks: HandoverTask[];
  getMyHandovers: (email: string) => HandoverTask[];
  getMyHandoverTasks: (email: string) => HandoverTask[];
  getAssignedToMe: (email: string) => HandoverTask[];
  createHandoverTask: (task: { owner_email: string; owner_name: string; assignee_email: string; assignee_name: string; title: string; description: string; priority: 'low' | 'medium' | 'high'; request_id?: string; }) => HandoverTask;
  updateHandoverTask: (taskId: string, updates: Partial<HandoverTask>) => void;
  updateHandoverTaskStatus: (taskId: string, status: HandoverTask['status']) => void;

  // Post-Leave Notes
  postLeaveNotes: PostLeaveNote[];
  getNotesForEmployee: (email: string) => PostLeaveNote[];
  getNotesForRequest: (requestId: string) => PostLeaveNote[];
  createPostLeaveNote: (note: Omit<PostLeaveNote, 'id' | 'created_at'>) => PostLeaveNote;

  // Notifications
  notifications: Notification[];
  getMyNotifications: (email: string) => Notification[];
  getUnreadCount: (email: string) => number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (email: string) => void;

  // Employees
  employees: Employee[];
  getTeamMembers: (tlEmail: string) => Employee[];

  // Support Queries
  supportQueries: SupportQuery[];
  getMySupportQueries: (email: string) => SupportQuery[];
  getAllSupportQueries: () => SupportQuery[];
  getOpenSupportQueries: () => SupportQuery[];
  createSupportQuery: (query: { from_email: string; from_name: string; category: QueryCategory; subject: string; message: string }) => SupportQuery;
  respondToSupportQuery: (queryId: string, response: string, responderEmail: string, responderName: string) => void;

  // Stats
  getOnLeaveToday: () => LeaveRequest[];
  getTeamOnLeaveToday: (tlEmail: string) => LeaveRequest[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [handoverTasks, setHandoverTasks] = useState<HandoverTask[]>(HANDOVER_TASKS);
  const [postLeaveNotes, setPostLeaveNotes] = useState<PostLeaveNote[]>(POST_LEAVE_NOTES);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [employees] = useState<Employee[]>(EMPLOYEES);
  const [supportQueries, setSupportQueries] = useState<SupportQuery[]>(SUPPORT_QUERIES);

  // Leave Request methods
  const getMyRequests = useCallback((email: string) => {
    return leaveRequests.filter(r => r.email === email);
  }, [leaveRequests]);

  const getTeamRequests = useCallback((tlEmail: string) => {
    return leaveRequests.filter(r => r.tl_email === tlEmail);
  }, [leaveRequests]);

  const getPendingTLApprovals = useCallback((tlEmail: string) => {
    return leaveRequests.filter(r => r.tl_email === tlEmail && r.status === 'pending');
  }, [leaveRequests]);

  const getPendingHRApprovals = useCallback(() => {
    return leaveRequests.filter(r => r.status === 'pending_hr');
  }, [leaveRequests]);

  const getAllRequests = useCallback(() => {
    return leaveRequests;
  }, [leaveRequests]);

  const getRequestById = useCallback((id: string) => {
    return leaveRequests.find(r => r.request_id === id);
  }, [leaveRequests]);

  const createLeaveRequest = useCallback((
    request: Omit<LeaveRequest, 'request_id' | 'timestamp' | 'status' | 'tl_status' | 'hr_status' | 'tl_decision_date' | 'hr_decision_date' | 'tl_comment' | 'hr_comment' | 'request_date'>
  ): LeaveRequest => {
    const now = new Date().toISOString();
    const requestDate = now.split('T')[0];
    const newRequest: LeaveRequest = {
      ...request,
      request_id: `REQ-2025-${String(leaveRequests.length + 1).padStart(3, '0')}`,
      request_date: requestDate,
      timestamp: now,
      status: 'pending',
      tl_status: 'pending',
      hr_status: '',
      tl_decision_date: '',
      hr_decision_date: '',
      tl_comment: '',
      hr_comment: '',
    };

    setLeaveRequests(prev => [...prev, newRequest]);

    // Create notification for TL
    const newNotification: Notification = {
      id: `NOTIF-${Date.now()}`,
      user_email: request.tl_email,
      type: 'approval',
      title: 'New Leave Request',
      message: `${request.full_name} has submitted a leave request for ${request.start_date} to ${request.end_date} requiring your approval.`,
      action_url: '/team/approvals',
      read: false,
      created_at: new Date().toISOString(),
      related_request_id: newRequest.request_id,
    };

    setNotifications(prev => [newNotification, ...prev]);

    return newRequest;
  }, [leaveRequests]);

  const processApproval = useCallback((action: ApprovalAction) => {
    const now = new Date().toISOString();

    setLeaveRequests(prev => prev.map(request => {
      if (request.request_id !== action.request_id) return request;

      let newStatus: RequestStatus = request.status;
      let updatedRequest = { ...request };

      if (action.actor_role === 'tl') {
        if (action.action === 'approve') {
          newStatus = 'pending_hr';
          updatedRequest = {
            ...updatedRequest,
            tl_status: 'approved',
            tl_decision_date: now,
            tl_comment: action.comment,
            status: newStatus,
          };

          // Create notification for HR
          const hrNotification: Notification = {
            id: `NOTIF-${Date.now()}`,
            user_email: request.hr_email,
            type: 'approval',
            title: 'Leave Request Awaiting HR Review',
            message: `${request.full_name}'s leave request has been approved by Team Lead and requires HR approval.`,
            action_url: '/hr/requests',
            read: false,
            created_at: now,
            related_request_id: request.request_id,
          };

          // Create notification for employee
          const employeeNotification: Notification = {
            id: `NOTIF-${Date.now() + 1}`,
            user_email: request.email,
            type: 'approval',
            title: 'Leave Request Approved by TL',
            message: `Your leave request has been approved by ${action.actor_name} and sent to HR for final approval.`,
            action_url: '/leave/history',
            read: false,
            created_at: now,
            related_request_id: request.request_id,
          };

          setNotifications(prevNotifs => [hrNotification, employeeNotification, ...prevNotifs]);
        } else {
          newStatus = 'declined';
          updatedRequest = {
            ...updatedRequest,
            tl_status: 'declined',
            tl_decision_date: now,
            tl_comment: action.comment,
            status: newStatus,
          };

          // Create notification for employee
          const employeeNotification: Notification = {
            id: `NOTIF-${Date.now()}`,
            user_email: request.email,
            type: 'rejection',
            title: 'Leave Request Declined',
            message: `Your leave request has been declined by ${action.actor_name}. Reason: ${action.comment}`,
            action_url: '/leave/history',
            read: false,
            created_at: now,
            related_request_id: request.request_id,
          };

          setNotifications(prevNotifs => [employeeNotification, ...prevNotifs]);
        }
      } else if (action.actor_role === 'hr') {
        if (action.action === 'approve') {
          newStatus = 'approved';
          updatedRequest = {
            ...updatedRequest,
            hr_status: 'approved',
            hr_decision_date: now,
            hr_comment: action.comment,
            status: newStatus,
          };

          // Create notification for employee
          const employeeNotification: Notification = {
            id: `NOTIF-${Date.now()}`,
            user_email: request.email,
            type: 'approval',
            title: 'Leave Request Fully Approved',
            message: `Great news! Your leave request for ${request.start_date} to ${request.end_date} has been fully approved.`,
            action_url: '/leave/history',
            read: false,
            created_at: now,
            related_request_id: request.request_id,
          };

          setNotifications(prevNotifs => [employeeNotification, ...prevNotifs]);
        } else {
          newStatus = 'hr_declined';
          updatedRequest = {
            ...updatedRequest,
            hr_status: 'declined',
            hr_decision_date: now,
            hr_comment: action.comment,
            status: newStatus,
          };

          // Create notification for employee
          const employeeNotification: Notification = {
            id: `NOTIF-${Date.now()}`,
            user_email: request.email,
            type: 'rejection',
            title: 'Leave Request Declined by HR',
            message: `Your leave request has been declined by HR. Reason: ${action.comment}`,
            action_url: '/leave/history',
            read: false,
            created_at: now,
            related_request_id: request.request_id,
          };

          setNotifications(prevNotifs => [employeeNotification, ...prevNotifs]);
        }
      }

      return updatedRequest;
    }));
  }, []);

  // Handover Task methods
  const getMyHandovers = useCallback((email: string) => {
    return handoverTasks.filter(t => t.owner_email === email);
  }, [handoverTasks]);

  const getMyHandoverTasks = useCallback((email: string) => {
    return handoverTasks.filter(t => t.owner_email === email);
  }, [handoverTasks]);

  const getAssignedToMe = useCallback((email: string) => {
    return handoverTasks.filter(t => t.assignee_email === email);
  }, [handoverTasks]);

  const createHandoverTask = useCallback((
    task: {
      owner_email: string;
      owner_name: string;
      assignee_email: string;
      assignee_name: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      request_id?: string;
    }
  ): HandoverTask => {
    const newTask: HandoverTask = {
      id: `HT-${String(handoverTasks.length + 1).padStart(3, '0')}`,
      request_id: task.request_id || '',
      title: task.title,
      description: task.description,
      owner_email: task.owner_email,
      owner_name: task.owner_name,
      assignee_email: task.assignee_email,
      assignee_name: task.assignee_name,
      priority: task.priority,
      status: 'pending',
      due_date: '',
      created_date: new Date().toISOString().split('T')[0],
      completed_date: '',
    };

    setHandoverTasks(prev => [...prev, newTask]);

    // Create notification for assignee
    const notification: Notification = {
      id: `NOTIF-${Date.now()}`,
      user_email: task.assignee_email,
      type: 'handover',
      title: 'New Handover Task Assigned',
      message: `${task.owner_name} has assigned you a handover task: ${task.title}`,
      action_url: '/handovers',
      read: false,
      created_at: new Date().toISOString(),
      related_request_id: task.request_id,
    };

    setNotifications(prev => [notification, ...prev]);

    return newTask;
  }, [handoverTasks]);

  const updateHandoverTask = useCallback((taskId: string, updates: Partial<HandoverTask>) => {
    setHandoverTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        ...updates,
      };
    }));
  }, []);

  const updateHandoverTaskStatus = useCallback((taskId: string, status: HandoverTask['status']) => {
    setHandoverTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        status,
      };
    }));
  }, []);

  // Post-Leave Notes methods
  const getNotesForEmployee = useCallback((email: string) => {
    return postLeaveNotes.filter(n => n.employee_email === email);
  }, [postLeaveNotes]);

  const getNotesForRequest = useCallback((requestId: string) => {
    return postLeaveNotes.filter(n => n.request_id === requestId);
  }, [postLeaveNotes]);

  const createPostLeaveNote = useCallback((
    note: Omit<PostLeaveNote, 'id' | 'created_at'>
  ): PostLeaveNote => {
    const newNote: PostLeaveNote = {
      ...note,
      id: `PLN-${String(postLeaveNotes.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
    };

    setPostLeaveNotes(prev => [...prev, newNote]);

    // Create notification for employee
    const notification: Notification = {
      id: `NOTIF-${Date.now()}`,
      user_email: note.employee_email,
      type: 'catchup',
      title: 'Post-Leave Notes Available',
      message: `${note.created_by_name} has added catch-up notes for your return from leave.`,
      action_url: '/handovers',
      read: false,
      created_at: new Date().toISOString(),
      related_request_id: note.request_id,
    };

    setNotifications(prev => [notification, ...prev]);

    return newNote;
  }, [postLeaveNotes]);

  // Notification methods
  const getMyNotifications = useCallback((email: string) => {
    return notifications.filter(n => n.user_email === email);
  }, [notifications]);

  const getUnreadCount = useCallback((email: string) => {
    return notifications.filter(n => n.user_email === email && !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id !== notificationId) return n;
      return { ...n, read: true };
    }));
  }, []);

  const markAllAsRead = useCallback((email: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.user_email !== email) return n;
      return { ...n, read: true };
    }));
  }, []);

  // Employee methods
  const getTeamMembers = useCallback((tlEmail: string) => {
    return employees.filter(e => e.tl_email === tlEmail);
  }, [employees]);

  // Stats methods
  const getOnLeaveToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return leaveRequests.filter(r => {
      if (r.status !== 'approved') return false;
      return r.start_date <= today && r.end_date >= today;
    });
  }, [leaveRequests]);

  const getTeamOnLeaveToday = useCallback((tlEmail: string) => {
    const today = new Date().toISOString().split('T')[0];
    return leaveRequests.filter(r => {
      if (r.status !== 'approved') return false;
      if (r.tl_email !== tlEmail) return false;
      return r.start_date <= today && r.end_date >= today;
    });
  }, [leaveRequests]);

  // Support Query methods
  const getMySupportQueries = useCallback((email: string) => {
    return supportQueries.filter(q => q.from_email === email);
  }, [supportQueries]);

  const getAllSupportQueries = useCallback(() => {
    return supportQueries;
  }, [supportQueries]);

  const getOpenSupportQueries = useCallback(() => {
    return supportQueries.filter(q => q.status !== 'resolved');
  }, [supportQueries]);

  const createSupportQuery = useCallback((
    query: { from_email: string; from_name: string; category: QueryCategory; subject: string; message: string }
  ): SupportQuery => {
    const newQuery: SupportQuery = {
      id: `SQ-${String(supportQueries.length + 1).padStart(3, '0')}`,
      from_email: query.from_email,
      from_name: query.from_name,
      category: query.category,
      subject: query.subject,
      message: query.message,
      response: null,
      responded_by_email: null,
      responded_by_name: null,
      responded_at: null,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    setSupportQueries(prev => [newQuery, ...prev]);

    // Create notification for HR - notify pelumia@curacel.com
    const hrNotification: Notification = {
      id: `NOTIF-${Date.now()}`,
      user_email: 'pelumia@curacel.com',
      type: 'query',
      title: 'New Support Query',
      message: `${query.from_name} submitted a query: ${query.subject}`,
      action_url: '/hr/queries',
      read: false,
      created_at: new Date().toISOString(),
    };

    setNotifications(prev => [hrNotification, ...prev]);

    return newQuery;
  }, [supportQueries]);

  const respondToSupportQuery = useCallback((
    queryId: string,
    response: string,
    responderEmail: string,
    responderName: string
  ) => {
    setSupportQueries(prev => prev.map(query => {
      if (query.id !== queryId) return query;
      return {
        ...query,
        response,
        responded_by_email: responderEmail,
        responded_by_name: responderName,
        responded_at: new Date().toISOString(),
        status: 'resolved' as const,
      };
    }));

    // Find the query to get the requester's email
    const query = supportQueries.find(q => q.id === queryId);
    if (query) {
      // Create notification for the employee
      const employeeNotification: Notification = {
        id: `NOTIF-${Date.now()}`,
        user_email: query.from_email,
        type: 'query_response',
        title: 'Query Response Received',
        message: `HR has responded to your query: "${query.subject}"`,
        action_url: '/support',
        read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications(prev => [employeeNotification, ...prev]);
    }
  }, [supportQueries]);

  return (
    <DataContext.Provider value={{
      leaveRequests,
      getMyRequests,
      getTeamRequests,
      getPendingTLApprovals,
      getPendingHRApprovals,
      getAllRequests,
      getRequestById,
      createLeaveRequest,
      processApproval,
      handoverTasks,
      getMyHandovers,
      getMyHandoverTasks,
      getAssignedToMe,
      createHandoverTask,
      updateHandoverTask,
      updateHandoverTaskStatus,
      postLeaveNotes,
      getNotesForEmployee,
      getNotesForRequest,
      createPostLeaveNote,
      notifications,
      getMyNotifications,
      getUnreadCount,
      markAsRead,
      markAllAsRead,
      employees,
      getTeamMembers,
      supportQueries,
      getMySupportQueries,
      getAllSupportQueries,
      getOpenSupportQueries,
      createSupportQuery,
      respondToSupportQuery,
      getOnLeaveToday,
      getTeamOnLeaveToday,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
