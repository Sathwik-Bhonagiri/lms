import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import connectCloudinary from './configs/cloudinary.js';

import { clerkMiddleware } from '@clerk/express';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';

import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// ✅ Step 1: Connect to MongoDB and Cloudinary
await connectDB();
await connectCloudinary();

// ✅ Step 2: Setup allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://upskillify.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true,
}));

// ✅ Step 3: Handle preflight requests (important for cookies/auth)
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true,
}));

// ✅ Step 4: Middleware and Routes
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('API is working 🎉'));

app.post('/clerk', express.json(), clerkWebhooks);

app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ Step 5: Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
