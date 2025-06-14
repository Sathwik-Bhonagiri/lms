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

// ✅ Connect to MongoDB and Cloudinary
await connectDB();
await connectCloudinary();

// ✅ CORS Setup
app.use(cors({
  origin: 'https://upskillify.vercel.app', // allow your frontend domain
  credentials: true, // allow cookies or authorization headers
}));

// ✅ Optional: Handle preflight for all routes
app.options('*', cors());

// ✅ Middleware
app.use(clerkMiddleware());

// ✅ Routes
app.get('/', (req, res) => res.send('API working'));

app.post('/clerk', express.json(), clerkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

// ✅ Stripe webhook requires raw body
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
