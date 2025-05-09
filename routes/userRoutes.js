// const express = require("express");
// const User = require("../model/User"); // ✅ Import User model

// const router = express.Router();

// // CREATE a new user
// router.post("/users", async (req, res) => {
//   try {
//     const newUser = new User(req.body);
//     await newUser.save();
//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// const bcrypt = require("bcrypt");

// // CREATE a new user with hashed password
// router.post("/", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10); // Hash password

//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();
    
//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });



// const jwt = require("jsonwebtoken");

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.json({ message: "Login successful", token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // READ all users
// router.get("/users", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// // ✅ Simple GET route for testing
// router.get("/", (req, res) => {
//     res.json([
//       { name: "John Doe", email: "john@example.com" },
//       { name: "Jane Doe", email: "jane@example.com" }
//     ]);
//   });


// module.exports = router;

// const express = require("express");
// const User = require("../model/User"); // ✅ Import User model
// const { protect } = require("../middleware/authMiddleware");
// const router = express.Router();
// const bcrypt = require('bcryptjs');

// // ✅ Import Plan model




// router.get("/me", protect, async (req, res) => {
//     try {
//       res.status(200).json(req.user); // You already set req.user in middleware
//     } catch (error) {
//       res.status(500).json({ message: "Something went wrong" });
//     }
//   });
// // ✅ Get all users from database
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find(); // Fetch all users
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users" });
//   }
// });

// router.post("/test", (req, res) => {
//   res.send("Test PUT route working!");
// });




// // ✅ Create a new user
// router.post("/", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const newUser = new User({ name, email, password });
//     await newUser.save();
//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating user" });
//   }
// });
// // PUT /api/users/update
// // PUT /api/users/update-profile
// // router.put('/update-profile', protect, async (req, res) => {
// //   try {
// //     const userId = req.user._id;

// //     console.log("➡️ Update request for user ID:", userId);
// //     console.log("📝 Incoming data:", req.body);

// //     const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
// //       new: true,
// //     });

// //     if (!updatedUser) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     res.json(updatedUser);
// //   } catch (err) {
// //     console.error("🔥 Error updating user:", err);
// //     res.status(500).json({ message: err.message || 'Server error' });
// //   }
// // });
// // PUT /api/users/update
// // router.put('/update',protect, async (req, res) => {
// //   const { username, email } = req.body;
// //   try {
// //     const updatedUser = await User.findByIdAndUpdate(
// //       req.user.id,
// //       { username, email },
// //       { new: true }
// //     );
// //     if (!updatedUser) {
// //        return res.status(404).json({ message: "User not found" });
// //     }
// //     res.json(updatedUser);
// //   } catch (error) {
// //     res.status(500).json({ message: "Error updating user" });
// //   }
// // });

// router.put("/update", protect, async (req, res) => {
//   const { username, email } = req.body;

//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.username = username || user.username;
//     user.email = email || user.email;

//     await user.save();

//     res.status(200).json({ message: "Profile updated successfully!" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });



// // PUT /api/users/change-password

// router.put('/change-password', protect, async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   // Basic validation
//   if (!currentPassword || !newPassword) {
//     return res.status(400).json({ message: "Both current and new passwords are required." });
//   }

//   try {
//     // Find user
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Compare current password
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Current password is incorrect." });
//     }

//     // Check if new password is same as old password
//     const isSamePassword = await bcrypt.compare(newPassword, user.password);
//     if (isSamePassword) {
//       return res.status(400).json({ message: "New password must be different from the old password." });
//     }

//     // Hash and update new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Save updated user
//     await user.save();

//     res.json({ message: "Password changed successfully." });
//   } catch (error) {
//     console.error("Error changing password:", error.message);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// });




// module.exports = router;


const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../model/User"); // Import User model
const { protect } = require("../middleware/authMiddleware"); // Import auth middleware

const router = express.Router();

// ===================
// @desc    Get current logged-in user's data
// @route   GET /api/users/me
// @access  Private
// ===================
router.get("/me", protect, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
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
