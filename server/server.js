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
import { getAllCourses } from './controllers/courseController.js';

const app = express();

await connectDB();
await connectCloudinary();

// ✅ Allowed origin for CORS
const allowedOrigins = ['https://upskillify.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // If you're using cookies or Authorization headers
}));

// ✅ Required for JSON parsing before routing
app.use(express.json());

// ✅ Public endpoints (MUST come before clerkMiddleware)
app.get('/', (req, res) => res.send("API working"));
app.get('/api/course/all', getAllCourses);  // Public route

// ✅ Webhooks (no Clerk)
app.post('/clerk', express.json(), clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 🔐 Clerk protected endpoints (AFTER public)
app.use(clerkMiddleware());

app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
