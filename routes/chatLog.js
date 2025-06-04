const express = require("express");
const ChatLog = require("../model/ChatLog");
const { protect } = require("../middleware/authMiddleware");
const User = require("../model/User"); // Assuming you have a User model to fetch user details

const router = express.Router();

const ADMIN_ID = "68247ee7f7819acaa2ae8090"; // Replace with your actual admin user ID from MongoDB

// Create a new message
router.post("/chatlog", protect, async (req, res) => {
  console.log("🔍 Incoming Body:", req.body);
  const { message, receiverId, fromAdmin = false } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    let senderId = req.user.id;
    let targetReceiverId = fromAdmin ? receiverId : ADMIN_ID;

    if (!targetReceiverId) {
      return res.status(400).json({ message: "Receiver ID missing" });
    }

    const chat = new ChatLog({
      senderId,
      receiverId: targetReceiverId,
      message,
      fromAdmin,
    });

    await chat.save();

   const io = req.app.get("socketio");
io.to(targetReceiverId).emit("newMessage", {
  senderId,
  receiverId: targetReceiverId, // Fix here too
  message,
  fromAdmin
});


    res.status(201).json({ message: "Message saved", chat });
  } catch (err) {
   console.error("❌ Chat Save Error Stack:\n", err.stack); 
    res.status(500).json({ message: "Failed to save message" });
  }
});

// Get all messages between user and admin
router.get("/chatlog", protect, async (req, res) => {
  try {
    const chats = await ChatLog.find({
      $or: [
        { senderId: req.user.id, receiverId: ADMIN_ID },
        { senderId: ADMIN_ID, receiverId: req.user.id },
      ]
    }).sort({ timestamp: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve chat" });
  }
});


// Admin route to get all messages from a specific user
// Get users who have messaged admin
router.get("/chatlog/users", protect, async (req, res) => {
  try {
    const users = await ChatLog.find({ receiverId: ADMIN_ID })
      .populate("senderId", "email") // get user info
      .distinct("senderId");

    const userDetails = await User.find({ _id: { $in: users } }).select("email");
    res.json(userDetails);
  } catch (err) {
    res.status(500).json({ message: "Failed to get users" });
  }
});

// Admin fetch conversation with user
router.get("/chatlog/admin/:userId", protect, async (req, res) => {
  try {
    const messages = await ChatLog.find({
      $or: [
        { senderId: req.params.userId, receiverId: ADMIN_ID },
        { senderId: ADMIN_ID, receiverId: req.params.userId },
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});


module.exports = router;
