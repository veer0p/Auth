import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize, testConnection } from './config/database';
import { emailService } from './services/email.service';
// Import models to register them with Sequelize before sync
import './models/User';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (before routes)
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({
        status: 'OK',
        message: 'Database connected successfully',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        status: 'ERROR',
        message: 'Database connection failed',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Routes
import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

// Error handling middleware (must be after routes)
import { errorHandler, notFoundHandler } from './middleware/error-handler';
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await testConnection();

    // Test email service connection
    if (process.env.EMAIL_USER || process.env.SMTP_USER) {
      await emailService.verifyConnection();
    } else {
      console.log('⚠ Email service not configured - set EMAIL_USER or SMTP_USER in .env');
    }

    // Sync database (only in development - use migrations in production)
    // This will create tables if they don't exist
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false, alter: false });
      console.log('✓ Database synchronized - tables created/verified');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;

