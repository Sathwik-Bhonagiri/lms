const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const app = express();

dotenv.config();

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

app.use(express.json());
app.use(cookieParser());

// Example route
app.get("/api/course/all", (req, res) => {
  res.json({ success: true, courses: [] }); // mock response, replace with DB logic
});

// Import & use your other routes below
// const courseRoutes = require("./routes/courseRoutes");
// app.use("/api/course", courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
