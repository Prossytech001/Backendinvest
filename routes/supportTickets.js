const express = require("express");
const router = express.Router();
const SupportTicket = require("../model/SupportTicket");
const { protect } = require("../middleware/authMiddleware"); // user auth
const adminAuth = require("../middleware/adminMiddleware"); // admin auth
const Notification = require("../model/Notification");

// POST - Create new ticket (User)
router.post("/", protect, async (req, res) => {
  try {
    const { subject, message, category, urgency } = req.body;
    const ticket = new SupportTicket({
      userId: req.user.id,
      subject,
      message,
      category,
      urgency
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to create ticket", error: err.message });
  }
});

// GET - Get all tickets (Admin)
router.get("/", adminAuth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate("userId", "email username").sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve tickets" });
  }
});

// GET - Get user's tickets
router.get("/user", protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user tickets" });
  }
});

// PATCH - Add reply to a ticket (Admin)
router.patch("/:id/reply", adminAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.replies.push({ from: "admin", message });
    ticket.status = "pending";
    await ticket.save();
    res.json(ticket);


    // Notify user about the reply
    ticket.replies.push({ from: "admin", message });
ticket.status = "pending";
await ticket.save();

// ✅ Create notification
await Notification.create({
  userId: ticket.userId,
  title: `Reply to your support ticket: ${ticket.subject}`,
  message: message,
  type: "ticket"
});
  } catch (err) {
    res.status(500).json({ message: "Failed to reply to ticket" });
  }
});

// PATCH - Change ticket status (Admin)
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

module.exports = router;
