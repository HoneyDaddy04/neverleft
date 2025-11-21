import { Router, Request, Response } from 'express';
import { csvService } from '../services/csvService.js';

const router = Router();

// Login endpoint
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const employee = csvService.getEmployeeByEmail(email);

    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, you'd verify password here
    // For demo purposes, we'll just return the employee data

    // Transform employee data to match frontend User type
    const user = {
      id: employee.employee_id,
      name: `${employee.first_name} ${employee.last_name}`,
      email: employee.email,
      role: determineRole(employee),
      department: employee.department,
      managerId: employee.manager_id || undefined,
      startDate: employee.hire_date,
      annualLeaveBalance: parseFloat(employee.annual_leave_balance) || 0,
      sickLeaveBalance: parseFloat(employee.sick_leave_balance) || 0,
      profileImage: undefined,
      slackId: undefined,
    };

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Helper function to determine user role
function determineRole(employee: any): 'Employee' | 'Manager' | 'HR' | 'Admin' {
  const position = employee.position.toLowerCase();

  if (position.includes('hr') || position.includes('human resources')) {
    return 'HR';
  }

  if (position.includes('director') || position.includes('head') || position.includes('manager')) {
    return 'Manager';
  }

  if (position.includes('admin')) {
    return 'Admin';
  }

  return 'Employee';
}

// Get current user (mock endpoint for demo)
router.get('/me', (req: Request, res: Response) => {
  // In a real app, you'd verify a JWT token here
  res.status(401).json({ error: 'Not authenticated' });
});

export default router;
