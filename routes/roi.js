const express = require("express");
const router = express.Router();

const Stake = require("../model/Stake");
const { protect } = require("../middleware/authMiddleware");

// Get daily ROI history for logged-in user
router.get("/roi-history", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active/completed stakes for the user
    const stakes = await Stake.find({ user: userId });

    let roiHistory = [];

    stakes.forEach((stake) => {
      const { startDate, duration, dailyROI, amount } = stake;
      const roiPerDay = (dailyROI / 100) * amount;

      for (let i = 0; i < duration; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const formattedDate = date.toISOString().split("T")[0];

        // Check if this date is already in roiHistory
        const existing = roiHistory.find((d) => d.date === formattedDate);
        if (existing) {
          existing.roi += roiPerDay;
        } else {
          roiHistory.push({ date: formattedDate, roi: roiPerDay });
        }
      }
    });

    // Sort by date
    roiHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(roiHistory);
  } catch (error) {
    console.error("ROI history error:", error);
    res.status(500).json({ message: "Server error fetching ROI history" });
  }
});

module.exports = router;
