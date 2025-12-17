const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/auth");

const User = require("../models/User");
const router = express.Router();

// File upload config (profile image upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Register route
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;

    // Check if user already exists by email or phone
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(409).json({ message: "User email already in use" });
    }
    // Check if user already exists by email
    // const existingUserPhone = await User.findOne({ phone });
    // if (existingUserPhone) {
    //     return res.status(409).json({ message: "User phone already in use" });
    // }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get profile image path if uploaded
    let profileImagePath = "";
    if (req.file) {
      profileImagePath = `/uploads/${req.file.filename}`;
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      profileImagePath,
      role: role || "guest",
    });

    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
    }

    // Lookup user
    const user = await User.findOne({ email });
    if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
    }

    // Password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImagePath: user.profileImagePath
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Return user info + token (never return password hash!)
    return res.json({
    token,
    user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImagePath: user.profileImagePath
    }
    });
} catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
}
});
  
// Update profile (name, avatar)
router.put("/profile", verifyToken, async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      // (Optionally allow profileImage update via another multer route)
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { firstName, lastName } },
        { new: true, select: "-password" }
      );
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Profile update failed" });
    }
  });

// Get current user's data (including wishlist)
router.get("/me", verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });  
  
module.exports = router;
