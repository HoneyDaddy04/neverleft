import { Router, Request, Response } from 'express';
import { csvService } from '../services/csvService.js';

const router = Router();

// Get all leave types
router.get('/', (req: Request, res: Response) => {
  try {
    const leaveTypes = csvService.getAllLeaveTypes();
    res.json(leaveTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave types' });
  }
});

// Get leave type by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const leaveType = csvService.getLeaveTypeById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ error: 'Leave type not found' });
    }
    res.json(leaveType);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave type' });
  }
});

export default router;
