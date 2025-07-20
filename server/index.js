require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const connectDB = require("./config/database");
const { connectClodinary } = require("./config/cloudinary");
const authroutes = require("./routes/authroute");
const placeroutes = require("./routes/placeroute");
const ownerHotelRoutes = require("./routes/ownerhotelroutes");
const hotelRouter = require("./routes/hotelroute");
const orderRouter = require("./routes/orderRoute");
const bookingrouter = require("./routes/bookingroute");
const souvenirrouter = require("./routes/souvenirroute");
const locationRoutes = require("./routes/location");
const { startCleanupScheduler } = require("./utils/cleanup");

// Connect to Database & Cloudinary
connectDB();
connectClodinary();

// Start cleanup scheduler for old location records
startCleanupScheduler();

const app = express();

// Secure CORS Setup
const allowedOrigins = [
  "https://souvinerbookingcom-git-main-adnan-alam-s-projects.vercel.app",
  "https://hotels-voyeger.vercel.app",
  "https://emergency-qlgnqlygl-rivu-chatterjees-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Routes
app.get("/", (req, res) => {
  res.send("Voyager API Server is Running");
});

app.use("/api/users", authroutes);
app.use("/api/places", placeroutes);
app.use("/api/orders", orderRouter);
app.use("/api/bookings", bookingrouter);
app.use("/api/souvenirs", souvenirrouter);
app.use("/api/location", locationRoutes);
app.use("/api/owner/hotel", ownerHotelRoutes);
// app.use("/api/hotels", hotelRouter); // Uncomment if needed

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
