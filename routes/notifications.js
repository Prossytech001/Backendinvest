const express = require("express");
const router = express.Router();
const Notification = require("../model/Notification");
const { protect } = require("../middleware/authMiddleware");

// GET notifications for user
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// PATCH - Mark notification as read
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const note = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Notification not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
});
// GET - Count of unread notifications
router.get("/unread/count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to get unread count" });
  }
});



module.exports = router;
