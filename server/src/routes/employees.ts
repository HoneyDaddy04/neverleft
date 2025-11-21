import { Router, Request, Response } from 'express';
import { csvService } from '../services/csvService.js';

const router = Router();

// Get all employees
router.get('/', (req: Request, res: Response) => {
  try {
    const employees = csvService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const employee = csvService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Get employees by department
router.get('/department/:department', (req: Request, res: Response) => {
  try {
    const employees = csvService.getEmployeesByDepartment(req.params.department);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees by department' });
  }
});

export default router;
