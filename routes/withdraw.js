const express = require ("express");
const User= require("../model/User.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// POST /api/withdraw
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(userId);

    if (user.withdrawableBalance < amount) {
      return res.status(400).json({ message: "Insufficient withdrawable balance" });
    }

    user.withdrawableBalance -= amount;

    // Optionally log the withdrawal history
    // user.withdrawals.push({ amount, date: new Date() });

    await user.save();

    res.status(200).json({ message: "Withdrawal successful", withdrawableBalance: user.withdrawableBalance });
  } catch (err) {
    console.error("Withdraw Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

