import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import courseRouter from './routes/courseRoute.js';
import { getAllCourses } from './controllers/courseController.js';

const app = express();

await connectDB();
await connectCloudinary();

// ✅ CORS fix
app.use(cors({
  origin: ['https://upskillify.vercel.app'],
  credentials: true
}));

// ✅ Parse JSON
app.use(express.json());

// ✅ Public route (must be before Clerk middleware)
app.get('/', (req, res) => res.send("API working"));
app.get('/api/course/all', getAllCourses);  // ← this is key

// ✅ Webhooks
app.post('/clerk', express.json(), clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ Clerk Middleware AFTER public routes
app.use(clerkMiddleware());

// ✅ Protected Routes
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter); // '/all' removed from inside this
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
