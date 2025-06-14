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
import bodyParser from 'body-parser';

// Initialize Express app
const app = express();

// Connect to databases
await connectDB();
await connectCloudinary();

// Enhanced CORS configuration
const allowedOrigins = [
  'https://upskillify.vercel.app',  // Production frontend
  'http://localhost:3000'           // Local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'svix-id', 'svix-timestamp', 'svix-signature'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Custom CORS handler middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins.join(','));
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, svix-id, svix-timestamp, svix-signature');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Webhook handlers - must come before body parsers
app.post('/clerk', bodyParser.raw({ type: 'application/json' }), clerkWebhooks);
app.post('/stripe', bodyParser.raw({ type: 'application/json' }), stripeWebhooks);

// Body parsers for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk authentication middleware for protected routes
app.use('/api/educator', clerkMiddleware(), educatorRouter);
app.use('/api/user', clerkMiddleware(), userRouter);

// Public routes (no authentication needed)
app.use('/api/course', courseRouter);

// Health check endpoint
app.get('/', (req, res) => res.status(200).json({ 
  status: 'running',
  message: 'Upskillify LMS API',
  timestamp: new Date().toISOString()
}));

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    suggestion: 'Check API documentation for valid endpoints'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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
});