const express = require("express");
const { registerUser, loginUser, getUserProfile, logoutUser } = require("../controller/Auth");
const { getUserReview, createReview } = require("../controller/reviewController");
const { uploadavater } = require("../controller/handleuploadavater");
const { createCommunityPost } = require("../controller/communityController");
const { authMiddleware, authorizeRoles } = require("../middleware/AuthMiddleware");

const authroutes = express.Router();

// Public Routes
authroutes.post("/register", registerUser);
authroutes.post("/login", loginUser);
authroutes.get("/logout", logoutUser);

// Protected Routes
authroutes.get("/profile", authMiddleware, getUserProfile);
authroutes.post("/avater", authMiddleware, uploadavater);
authroutes.post("/community", authMiddleware, createCommunityPost);
authroutes.post("/createReview", authMiddleware, createReview);

// Role-Based Routes
authroutes.get("/admin-test", authMiddleware, authorizeRoles("Admin"), (req, res) => {
    res.json({ message: "Hello Admin, this is a protected route." });
});

authroutes.get("/owner-test", authMiddleware, authorizeRoles("Owner"), (req, res) => {
    res.json({ message: "Hello Owner, this route is only for Owners." });
});

module.exports = authroutes;
