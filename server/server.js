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

// 1. CORS Configuration (Must be first)
const allowedOrigins = [
  'https://upskillify.vercel.app',
  'http://localhost:3000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  next();
});

// 2. Database connections
await connectDB();
await connectCloudinary();

// 3. Webhook handlers
app.post('/clerk', express.raw({type: 'application/json'}), clerkWebhooks);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// 4. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Public routes (no auth)
app.use('/api/course', courseRouter);

// 6. Protected routes (require auth)
app.use('/api/educator', clerkMiddleware(), educatorRouter);
app.use('/api/user', clerkMiddleware(), userRouter);

// 7. Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Upskillify LMS API',
    cors: {
      allowedOrigins,
      detectedOrigin: req.headers.origin || 'none',
      isAllowed: allowedOrigins.includes(req.headers.origin)
    }
  });
});

// 8. Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 9. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed Origins:', allowedOrigins);
});