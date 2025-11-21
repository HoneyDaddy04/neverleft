import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import employeesRouter from './routes/employees.js';
import leaveRequestsRouter from './routes/leaveRequests.js';
import leaveTypesRouter from './routes/leaveTypes.js';
import departmentsRouter from './routes/departments.js';
import leaveBalancesRouter from './routes/leaveBalances.js';
import holidaysRouter from './routes/holidays.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'NeverLeft API is running' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/leave-requests', leaveRequestsRouter);
app.use('/api/leave-types', leaveTypesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/leave-balances', leaveBalancesRouter);
app.use('/api/holidays', holidaysRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 NeverLeft API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
});
