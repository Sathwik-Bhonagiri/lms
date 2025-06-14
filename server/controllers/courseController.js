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

// Connect to databases
await connectDB();
await connectCloudinary();

// Manual CORS Implementation (Bulletproof)
const allowedOrigins = [
  'https://upskillify.vercel.app',
  'http://localhost:3000'
];

// 1. Middleware to handle CORS manually
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, svix-id, svix-timestamp, svix-signature');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 2. Webhook handlers
app.post('/clerk', express.raw({type: 'application/json'}), clerkWebhooks);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Routes
app.use('/api/educator', clerkMiddleware(), educatorRouter);
app.use('/api/user', clerkMiddleware(), userRouter);
app.use('/api/course', courseRouter);

// 5. Health check with CORS headers
app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://upskillify.vercel.app');
  res.json({
    status: 'running',
    message: 'Upskillify LMS API',
    timestamp: new Date().toISOString(),
    routes: {
      courses: '/api/course/all',
      webhooks: ['/clerk', '/stripe']
    }
  });
});

// 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ################################################
  🚀 Server running on port: ${PORT}
  ################################################
  CORS Allowed Origins: 
  - ${allowedOrigins.join('\n  - ')}
  `);
  
  // Test CORS configuration
  console.log('Testing CORS configuration:');
  allowedOrigins.forEach(origin => {
    console.log(`- ${origin} => ${origin === 'https://upskillify.vercel.app' ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
});