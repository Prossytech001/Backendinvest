const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  from: { type: String, enum: ["user", "admin"], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ["Withdrawals", "Login", "Staking", "General"], default: "General" },
  urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["open", "pending", "resolved"], default: "open" },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
