const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminMiddleware");
const Payment = require("../model/Payment");
const user = require("../model/User");



router.get("/deposits", adminAuth, async (req, res) => {
  try {
    const { status, start, end } = req.query;
    const query = {};

    if (status) query.status = status;
    if (start || end) {
      query.createdAt = {};
      if (start) query.createdAt.$gte = new Date(start);
      if (end) query.createdAt.$lte = new Date(end);
    }

    const deposits = await Payment.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    res.status(500).json({ message: "Failed to load deposits" });
  }
});

router.get("/deposit/:id", adminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("user", "username email");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ message: "Failed to load payment" });
  }
});


module.exports = router;
