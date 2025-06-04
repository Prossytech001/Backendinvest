const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Admin" if needed
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    fromAdmin: {
      type: Boolean,
      default: false, // false means message from user
    },
  },
  {
    timestamps: true,
  }
  
);

module.exports = mongoose.model("ChatLog", chatLogSchema);
