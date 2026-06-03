import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import interestsRouter from './routes/interests.js';
import wishlistRouter from './routes/wishlist.js';
import notificationsRouter from './routes/notifications.js';
import uploadRouter from './routes/upload.js';
import reportsRouter from './routes/reports.js';

// Import error handler & rate limit middlewares
import errorHandler from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimitMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client (supporting ports 5173 & 5174 dynamically)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log request middleware
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Apply global rate limiting to all API requests (max 300 per 15 mins)
app.use('/api', rateLimiter(300, 15 * 60 * 1000));

// Apply strict rate limiting to auth routes (max 60 per 15 mins)
app.use('/api/auth', rateLimiter(60, 15 * 60 * 1000));

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/interests', interestsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/reports', reportsRouter);

// Base route ping check
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Campus Market API is fully operational! 🎓' });
});

// Error handling fallback
app.use(errorHandler);

// Start server listening
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🎓 Campus Market server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`================================================`);
});
