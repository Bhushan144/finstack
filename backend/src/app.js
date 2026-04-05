import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';

// --- Route Imports ---
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import transactionRouter from './routes/transactionRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';

// --- Error Handler Import ---
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// --- Global Security & Parsing Middlewares ---

// CORS strictly configured from your .env
app.use(cors({
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
    credentials: true 
}));

app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse JSON and URL-encoded data with strict size limits
app.use(express.json({ limit: '16kb' })); 
app.use(express.urlencoded({ extended: true, limit: '16kb' })); 

// Parse cookies (Crucial for handling your HttpOnly Refresh Tokens)
app.use(cookieParser()); 

// --- API Routes ---
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);              // Admin user management
app.use('/api/v1/transactions', transactionRouter); // Financial records
app.use('/api/v1/dashboard', dashboardRouter);      // Aggregation pipelines

// --- Base Health Check ---
app.get('/', (req, res) => {
    res.send("finStack API is running perfectly...");
});

// --- Global Error Handler ---
// MUST be the absolute last middleware to catch all async and validation errors
app.use(errorHandler);

export { app };