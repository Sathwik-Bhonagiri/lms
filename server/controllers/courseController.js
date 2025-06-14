import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// Connect to databases
await connectDB();
await connectCloudinary();

// Critical CORS Fixes
const allowedOrigins = [
  'https://upskillify.vercel.app',
  'http://localhost:3000'
];

// 1. Use CORS middleware with specific configuration
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// 2. Handle preflight requests globally
app.options('*', cors());

// 3. Add manual CORS headers as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Webhook handlers (must come before body parsers)
app.post('/clerk', express.raw({type: 'application/json'}), clerkWebhooks);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Clerk middleware only to protected routes
app.use('/api/educator', clerkMiddleware(), educatorRouter);
app.use('/api/user', clerkMiddleware(), userRouter);

// Public routes
app.use('/api/course', courseRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'running',
    message: 'Upskillify LMS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    allowedOrigins
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ################################################
  🚀 Server running on port: ${PORT}
  ################################################
  Environment: ${process.env.NODE_ENV || 'development'}
  CORS Allowed: ${allowedOrigins.join(', ')}
  `);
  
  // Log CORS configuration
  console.log('CORS Configuration:');
  console.log('- Allowed Origins:', allowedOrigins);
  console.log('- Allowed Methods:', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']);
  console.log('- Allowed Headers:', ['Content-Type', 'Authorization']);
});