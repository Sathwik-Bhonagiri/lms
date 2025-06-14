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

// =====================================
// 1. CORS CONFIGURATION (MUST BE FIRST)
// =====================================
const allowedOrigins = [
  'https://upskillify.vercel.app',
  'http://localhost:3000'
];

// Main CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers for all responses
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, svix-id, svix-timestamp, svix-signature');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// =====================================
// 2. DATABASE CONNECTIONS
// =====================================
await connectDB();
await connectCloudinary();

// =====================================
// 3. WEBHOOK HANDLERS
// =====================================
app.post('/clerk', express.raw({type: 'application/json'}), clerkWebhooks);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// =====================================
// 4. BODY PARSERS
// =====================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// 5. ROUTES WITH PROPER AUTH
// =====================================
// Public routes (no authentication)
app.use('/api/course', courseRouter);

// Protected routes (require authentication)
app.use('/api/user', clerkMiddleware(), userRouter);
app.use('/api/educator', clerkMiddleware(), educatorRouter);

// =====================================
// 6. HEALTH CHECK ENDPOINT
// =====================================
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Upskillify LMS API',
    cors: {
      allowedOrigins,
      yourOrigin: req.headers.origin,
      isAllowed: allowedOrigins.includes(req.headers.origin)
    }
  });
});

// =====================================
// 7. START SERVER
// =====================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed Origins:', allowedOrigins);
});