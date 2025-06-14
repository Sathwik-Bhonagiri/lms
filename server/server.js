// server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/clerk-sdk-node';
import courseRouter from './routes/course.route.js';
import userRouter from './routes/user.route.js';
import { getAllCourses } from './controllers/course.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Step 1: Configure CORS Middleware
const allowedOrigins = ['https://upskillify.vercel.app'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Step 2: Add JSON parser
app.use(express.json());

// ✅ Step 3: Public route (without auth)
app.get('/api/course/all', getAllCourses);

// ✅ Step 4: Clerk auth middleware
app.use(clerkMiddleware());

// ✅ Step 5: Protected routes
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// ✅ Step 6: Connect to MongoDB and run server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });
