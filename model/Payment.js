const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usdt" },
    status: { type: String, enum: ['waiting', 'finished', 'failed'], default: 'waiting' },
    paymentId: { type: String, unique: true },
   payAddress: { type: String },
    invoiceUrl: { type: String }, // ✅ Add this field

    transactionDetails: Object,
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
