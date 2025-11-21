import { Router, Request, Response } from 'express';
import { csvService } from '../services/csvService.js';

const router = Router();

// Get all holidays
router.get('/', (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    let holidays = csvService.getAllHolidays();

    if (year) {
      holidays = csvService.getHolidaysByYear(year as string);
    }

    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

// Get holiday by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const holiday = csvService.getHolidayById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    res.json(holiday);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holiday' });
  }
});

export default router;
