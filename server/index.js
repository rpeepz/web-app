const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const propertyRoutes = require("./routes/property");
app.use("/api/properties", propertyRoutes);

const bookingRoutes = require("./routes/booking");
app.use("/api/bookings", bookingRoutes);

// const userRoutes = require("./routes/user");
// app.use("/api/user", userRoutes);



// MongoDB Connection
const mongoURL = process.env.MONGO_URL;

mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((error) => console.log(`❌ MongoDB connection error: ${error.message}`));

// Basic test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Property Rental API" });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local URL: http://localhost:${PORT}`);
});
