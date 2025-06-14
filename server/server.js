import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import courseRouter from './routes/course.route.js';
import { getAllCourses } from './controllers/course.controller.js';
import { clerkMiddleware } from '@clerk/clerk-sdk-node';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Allow requests only from your frontend
const allowedOrigins = ['https://upskillify.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Public Route — no Clerk
app.get('/api/course/all', getAllCourses);

// ✅ Optional Test Route to Debug CORS
app.get('/cors-test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// ✅ Clerk middleware (after public routes)
app.use(clerkMiddleware());

// ✅ Protected Routes
app.use('/api/course', courseRouter);

// ✅ MongoDB Connect and Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
