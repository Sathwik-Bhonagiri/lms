// server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/clerk-sdk-node';
import courseRouter from './routes/course.route.js';
import { getAllCourses } from './controllers/course.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup
const allowedOrigins = ['https://upskillify.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());

// ✅ Public route (no Clerk)
app.get('/api/course/all', getAllCourses);

// ✅ Clerk auth middleware
app.use(clerkMiddleware());

// ✅ Protected route
app.use('/api/course', courseRouter);

// ✅ Connect DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
