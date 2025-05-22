// routes/adminUsers.js (new or existing file)
const express = require('express');
const router = express.Router();
const User = require('../model/User');
const adminAuth = require('../middleware/adminMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// UPDATE USER
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
});

// DELETE USER
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
});

// TOGGLE STATUS
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isVerified = !user.isVerified;
    await user.save();
    res.status(200).json({ message: `User ${user.isVerified ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle status", error });
  }
});

//create a new user
router.post('/create', adminAuth, async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, role });
  const saved = await newUser.save();

  const { password: _, ...userData } = saved.toObject();
  res.status(201).json({ message: "User created", user: userData });
});

module.exports = router;

