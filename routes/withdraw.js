// const express = require ("express");
// const User= require("../model/User.js");
// const { protect } = require("../middleware/authMiddleware.js");

// const router = express.Router();

// // POST /api/withdraw
// router.post("/", protect, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { amount } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: "Invalid amount" });
//     }

//     const user = await User.findById(userId);

//     if (user.withdrawableBalance < amount) {
//       return res.status(400).json({ message: "Insufficient withdrawable balance" });
//     }

//     user.withdrawableBalance -= amount;

//     // Optionally log the withdrawal history
//     // user.withdrawals.push({ amount, date: new Date() });

//     await user.save();

//     res.status(200).json({ message: "Withdrawal successful", withdrawableBalance: user.withdrawableBalance });
//   } catch (err) {
//     console.error("Withdraw Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

const express = require("express");
const Withdrawal = require("../model/withdrawal");
const User = require("../model/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/withdraw
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, walletAddress } = req.body;

    if (!amount || amount <= 0 || !walletAddress) {
      return res.status(400).json({ message: "Invalid withdrawal details" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.withdrawableBalance < amount) {
      return res.status(400).json({ message: "Insufficient withdrawable balance" });
    }

    // Deduct balance immediately
    user.withdrawableBalance -= amount;

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      walletAddress,
    });

    await user.save();
    await withdrawal.save();

    res.status(201).json({
      message: "Withdrawal request submitted. Awaiting admin approval.",
      newBalance: user.withdrawableBalance,
    });
  } catch (err) {
    console.error("Withdraw Error:", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
