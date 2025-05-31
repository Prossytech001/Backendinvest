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

// const express = require("express");
// const Withdrawal = require("../model/withdrawal");
// const User = require("../model/User");
// const { protect } = require("../middleware/authMiddleware");

// const router = express.Router();

// // POST /api/withdraw
// router.post("/", protect, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { amount, walletAddress } = req.body;

//     if (!amount || amount <= 0 || !walletAddress) {
//       return res.status(400).json({ message: "Invalid withdrawal details" });
//     }

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.withdrawableBalance < amount) {
//       return res.status(400).json({ message: "Insufficient withdrawable balance" });
//     }

//     // Deduct balance immediately
//     user.withdrawableBalance -= amount;

//     // Create withdrawal request
//     const withdrawal = new Withdrawal({
//       user: userId,
//       amount,
//       walletAddress,
//     });

//     await user.save();
//     await withdrawal.save();

//     res.status(201).json({
//       message: "Withdrawal request submitted. Awaiting admin approval.",
//       newBalance: user.withdrawableBalance,
//     });
//   } catch (err) {
//     console.error("Withdraw Error:", err.message);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// });

// module.exports = router;
const express = require("express");
const Withdrawal = require("../model/withdrawal");
const User = require("../model/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Wallet validators

const isTRC20 = (addr) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr);
const isValidWallet = (addr) => isTRC20(addr);

// POST /api/withdraw
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, walletAddress } = req.body;

    // Validate input
    if (!amount || amount <= 0 || !walletAddress) {
      return res.status(400).json({ message: "Invalid withdrawal details" });
    }

    // Validate wallet address format
    if (!isValidWallet(walletAddress)) {
      return res.status(400).json({ message: "Invalid wallet address. Must be TRC20 format." });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check balance
    if (user.withdrawableBalance < amount) {
      return res.status(400).json({ message: "Insufficient withdrawable balance" });
    }

    // Deduct balance
    user.withdrawableBalance -= amount;

    // Create withdrawal record
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


// GET /api/withdraw/balance
router.get("/balance", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("withdrawableBalance");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ withdrawableBalance: user.withdrawableBalance });
  } catch (err) {
    console.error("Balance Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
