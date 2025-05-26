const express = require("express");
const Withdrawal = require("../model/withdrawal");
const User = require("../model/User");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ Get all pending withdrawals
router.get("/pending", adminAuth, async (req, res) => {
  const pending = await Withdrawal.find({ status: 'pending' }).populate('user', 'username email');
  res.json(pending);
});

// ✅ Approve a withdrawal
router.put("/approve/:id", adminAuth, async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
  if (!withdrawal || withdrawal.status !== 'pending') {
    return res.status(400).json({ message: "Invalid withdrawal or already processed" });
  }

  withdrawal.status = 'approved';
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  res.json({ message: "Withdrawal approved successfully" });
});

// ❌ Decline a withdrawal
router.put("/decline/:id", adminAuth, async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
  if (!withdrawal || withdrawal.status !== 'pending') {
    return res.status(400).json({ message: "Invalid withdrawal or already processed" });
  }

  const user = await User.findById(withdrawal.user._id);
  user.withdrawableBalance += withdrawal.amount;
  await user.save();

  withdrawal.status = 'declined';
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  res.json({ message: "Withdrawal declined and balance refunded" });
});

// GET /api/admin/withdrawals?status=pending&page=1
router.get('/', adminAuth, async (req, res) => {
  const status = req.query.status || 'pending';
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  const query = status === 'all' ? {} : { status };
  const withdrawals = await Withdrawal.find(query)
    .populate('user', 'username email')
    .skip((page - 1) * limit)
    .limit(limit);

  res.json(withdrawals);
});


module.exports = router;
