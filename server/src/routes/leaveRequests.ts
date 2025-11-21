import { Router, Request, Response } from 'express';
import { csvService } from '../services/csvService.js';

const router = Router();

// Get all leave requests
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, employeeId } = req.query;

    let requests = csvService.getAllLeaveRequests();

    if (status) {
      requests = csvService.getLeaveRequestsByStatus(status as string);
    }

    if (employeeId) {
      requests = requests.filter(req => req.employee_id === employeeId);
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Get leave request by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const request = csvService.getLeaveRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave request' });
  }
});

// Get leave requests by employee
router.get('/employee/:employeeId', (req: Request, res: Response) => {
  try {
    const requests = csvService.getLeaveRequestsByEmployee(req.params.employeeId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee leave requests' });
  }
});

export default router;
