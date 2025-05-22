// routes/adminRoutes.js
// const express = require("express");
// const router = express.Router();
// const User = require("../model/User");
// const adminMiddleware = require("../middleware/adminMiddleware");
// const { protect } = require("../middleware/authMiddleware");

// // GET all users
// router.get("/users",protect, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password -otp -resetToken -otpExpires");
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch users", error: err.message });
//   }
// });


// // Update user info
// router.put("/users/:id",protect, adminMiddleware, async (req, res) => {
//     const { email, balance } = req.body;
  
//     try {
//       const user = await User.findById(req.params.id);
//       if (!user) return res.status(404).json({ message: "User not found" });
  
//       if (email) user.email = email;
//       if (typeof balance === "number") user.balance = balance;
  
//       await user.save();
//       res.status(200).json({ message: "User updated", user });
//     } catch (err) {
//       res.status(500).json({ message: "Failed to update user", error: err.message });
//     }
//   });
  
//   module.exports = router;
// const express = require('express');
// const router = express.Router();
// const adminAuth = require('../middleware/adminMiddleware');
// const User = require('../model/User');
// const verifyAdminToken = require('../middleware/verifyAdminToken');

// // Get all users (admin only)
// router.get('/users', adminAuth, async (req, res) => {
//     try {
//       // Only return if admin is authenticated
//       const users = await User.find(); // Or your logic
//       res.json(users);
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
// router.get('/verify', adminAuth, (req, res) => {
//   console.log('[✅ Verified]', req.admin.email); // Add this!
//   res.status(200).json({ message: 'Token is valid' });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminMiddleware'); // this must use the correct middleware!
const User = require('../model/User');

// ✅ GET /api/admin/users — get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('[Admin GET /users] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/admin/verify — verify admin token
router.get('/verify', adminAuth, (req, res) => {
  console.log('[✅ Verified Admin]', req.admin.email); // helpful for debugging
  res.status(200).json({ message: 'Token is valid', admin: req.admin });
});

module.exports = router;
