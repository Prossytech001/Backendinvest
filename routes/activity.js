// routes/activity.js
const express = require('express');
const router = express.Router();
const Activitys = require('../model/Activitys');
const {protect} = require('../middleware/authMiddleware');

router.get('/recent', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 7;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const activities = await Activitys.find({
      user: userId,
      date: { $gte: cutoff }
    })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Activitys.countDocuments({
      user: userId,
      date: { $gte: cutoff }
    });

    res.status(200).json({ activities, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

module.exports = router;
