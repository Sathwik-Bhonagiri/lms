import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'

const app = express()

await connectDB()
await connectCloudinary()

// Enhanced CORS configuration
const allowedOrigins = [
  'https://upskillify.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Clerk middleware should come AFTER CORS
app.use(clerkMiddleware());

// ... rest of your routes

app.get('/', (req, res) => res.send("API Working"));

// Webhook handlers - must come before body parsers
app.post('/clerk', express.raw({type: 'application/json'}), clerkWebhooks);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Body parsers for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your existing routes
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});