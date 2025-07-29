const express = require("express");
const router = express.Router();
const User = require("../model/User");
const { protect } = require("../middleware/authMiddleware");

// GET /api/users/reward
// router.get("/reward", protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).populate("referredUsers", "username");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const totalReward = user.totalReward || 0;
//     const referredUsernames = user.referredUsers.map(u => u.username);

//     res.status(200).json({
//       totalReward,
//       referredUsernames,
//     });
//   } catch (err) {
//     console.error("Reward Fetch Error:", err);
//     res.status(500).json({ message: "Failed to load reward info" });
//   }
// });
router.get('/reward', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("referredUsers", "username");
    res.json({
      totalReward: user.totalReward || 0,
      referredUsers: user.referredUsers || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
