import { Router, Request, Response } from 'express';
import { csvService } from '../services/csvService.js';

const router = Router();

// Get all departments
router.get('/', (req: Request, res: Response) => {
  try {
    const departments = csvService.getAllDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get department by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const department = csvService.getDepartmentById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

export default router;
