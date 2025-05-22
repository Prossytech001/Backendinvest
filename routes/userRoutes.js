


const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../model/User"); // Import User model
const { protect } = require("../middleware/authMiddleware"); // Import auth middleware
const Stake = require("../model/Stake"); // Import Stake model
const Activitys = require("../model/Activitys"); // Import Activity model
const router = express.Router();

// ===================
// @desc    Get current logged-in user's data
// @route   GET /api/users/me
// @access  Private
// ===================
// ===================
// @desc    Get current logged-in user's data + ROI claim status
// @route   GET /api/users/me
// @access  Private
// ===================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch user stakes to check unclaimed ROI
    const stakes = await Stake.find({ user: user._id });

    const todayStr = new Date().toDateString();
    const hasUnclaimedToday = stakes.some(stake => {
      if (stake.isCompleted) return false;
      const last = new Date(stake.lastClaimDate || stake.startDate).toDateString();
      return last !== todayStr;
    });

    res.status(200).json({
      ...user.toObject(),
      hasUnclaimedToday
    });
  } catch (error) {
    console.error("Error in /me route:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ===================
// @desc    Get all users (For admin use maybe)
// @route   GET /api/users
// @access  Public (you can protect it later if you want)
// ===================
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ===================
// @desc    Test route
// @route   POST /api/users/test
// @access  Public
// ===================
router.post("/test", (req, res) => {
  res.send("Test POST route working!");
});

// ===================
// @desc    Create/Register new user
// @route   POST /api/users
// @access  Public
// ===================
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// ===================
// @desc    Update user profile (username, email)
// @route   PUT /api/users/update
// @access  Private
// ===================
router.put("/update", protect, async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===================
// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
// ===================
router.put("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Basic validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new passwords are required." });
  }

  try {
    const user = await User.findById(req.user._id); // Fix: use _id, not userId

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from the old password." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
