import { Router, Request, Response } from 'express';
import { csvService } from '../services/csvService.js';

const router = Router();

// Get all leave balances
router.get('/', (req: Request, res: Response) => {
  try {
    const balances = csvService.getAllLeaveBalances();
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave balances' });
  }
});

// Get leave balances by employee
router.get('/employee/:employeeId', (req: Request, res: Response) => {
  try {
    const balances = csvService.getLeaveBalancesByEmployee(req.params.employeeId);
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee leave balances' });
  }
});

// Get specific leave balance for employee and type
router.get('/employee/:employeeId/type/:leaveTypeId', (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const balance = csvService.getLeaveBalanceByEmployeeAndType(
      req.params.employeeId,
      req.params.leaveTypeId,
      year as string
    );
    if (!balance) {
      return res.status(404).json({ error: 'Leave balance not found' });
    }
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
});

export default router;
