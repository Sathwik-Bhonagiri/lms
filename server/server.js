const express = require("express");
const cors = require("cors");
const app = express();

// CORS configuration
const allowedOrigins = ["https://upskillify.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// Other middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example route
app.get("/api/course/all", (req, res) => {
  // If using authentication, check it here
  res.json({
    success: true,
    courses: [/* your course data */],
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
