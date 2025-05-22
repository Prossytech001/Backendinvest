const express = require('express');
const router = express.Router();
const User = require('../model/User');
const adminAuth = require('../middleware/adminMiddleware');
const Activity = require('../model/Activity');

// GET /api/admin/overview/total-users
router.get('/total-users', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    res.json({ totalUsers });
  } catch (error) {
    console.error('Error fetching total users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/total-user-balances', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
    res.status(200).json({ totalBalance });
  } catch (error) {
    console.error('Error fetching user balances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/total-user-withdrawable-balances', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    const totalWithdrawable = users.reduce((sum, user) => sum + (user.withdrawableBalance || 0), 0);
    res.status(200).json({ totalWithdrawable });
  } catch (error) {
    console.error('Error fetching withdrawable balances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/recent-activity', adminAuth, async (req, res) => {
  try {
    const recentUsers = await User.find({}, 'username email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const activities = recentUsers.map(user => ({
      message: `${user.username} signed up`,
      email: user.email,
      timestamp: user.createdAt,
    }));

    res.json({ activities });
  } catch (err) {
    console.error('Failed to fetch recent activity:', err.message);
    res.status(500).json({ message: 'Could not load activity feed' });
  }
});



module.exports = router;
