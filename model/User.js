const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true ,unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password// In models/User.js
    payments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],// Reference to Payment model
    balance: { type: Number, default: 100 }, // User's available balance
    stakes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stake" }], // Reference to staked funds
    totalEarnings: { type: Number, default: 0 }, // Daily ROI accumulates here
    withdrawableBalance: { type: Number, default: 0 }, // Earnings from completed plans
    resetToken: String,
    resetTokenExpiration: Date,
    createdAt: { type: Date, default: Date.now },
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema); // ✅ Export the model
