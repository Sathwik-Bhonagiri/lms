const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // adjust if needed
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
connectDB(); // Connect to MongoDB

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Manually handle CORS for production deployment
const allowedOrigins = ['https://upskillify.vercel.app'];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Routes
app.use('/api/course', courseRoutes);
app.use('/api/user', userRoutes);

// Health check or default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
