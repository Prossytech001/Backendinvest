const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Payment = require("../model/Payment");
const Withdrawal = require("../model/withdrawal");

router.get("/history", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const deposits = await Payment.find({ user: userId }).sort({ createdAt: -1 });
    const withdrawals = await Withdrawal.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ deposits, withdrawals });
  } catch (err) {
    res.status(500).json({ message: "Failed to load history" });
  }
});

module.exports = router;
