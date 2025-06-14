import express from 'express';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// ======================
// 1. CORS CONFIGURATION
// ======================
const allowedOrigins = [
  'https://upskillify.vercel.app',  // Production frontend
  'http://localhost:3000'           // Local development
];

// Main CORS middleware - MUST BE FIRST
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers for allowed origins
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, svix-id, svix-timestamp, svix-signature');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Immediately handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Explicit OPTIONS handler for all routes
app.options('*', (req, res) => res.status(200).end());

// =========================
// 2. DATABASE CONNECTIONS
// =========================
await connectDB();
await connectCloudinary();

// =====================
// 3. WEBHOOK HANDLERS
// =====================
app.post('/clerk', express.raw({type: 'application/json'}), clerkWebhooks);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// ====================
// 4. BODY PARSERS
// ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================
// 5. ROUTES
// ====================
app.use('/api/educator', clerkMiddleware(), educatorRouter);
app.use('/api/user', clerkMiddleware(), userRouter);
app.use('/api/course', courseRouter);

// ====================
// 6. TEST ENDPOINTS
// ====================
// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Upskillify LMS API',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins,
      headers: {
        origin: req.headers.origin,
        allowed: allowedOrigins.includes(req.headers.origin)
      }
    }
  });
});

// CORS test endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    yourOrigin: req.headers.origin,
    allowed: allowedOrigins.includes(req.headers.origin),
    timestamp: new Date().toISOString()
  });
});

// ====================
// 7. ERROR HANDLING
// ====================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    suggestion: 'Check API documentation at /'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ====================
// 8. SERVER START
// ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ################################################
  🚀 Server running on port: ${PORT}
  ################################################
  Environment: ${process.env.NODE_ENV || 'development'}
  CORS Allowed Origins: 
  ${allowedOrigins.map(o => `  - ${o}`).join('\n')}
  
  Test Endpoints:
  - Health Check:   http://localhost:${PORT}/
  - CORS Test:      http://localhost:${PORT}/test-cors
  - API Courses:    http://localhost:${PORT}/api/course/all
  `);
});