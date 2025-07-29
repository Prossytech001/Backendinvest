// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//     username: { type: String, required: true ,unique: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true }, // Store hashed password// In models/User.js
//     payments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],// Reference to Payment model
//     balance: { type: Number, default: 100 }, // User's available balance
//     stakes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stake" }], // Reference to staked funds
//     totalEarnings: { type: Number, default: 0 }, // Daily ROI accumulates here
//     withdrawableBalance: { type: Number, default: 0 }, // Earnings from completed plans
//     resetToken: String,
//     resetTokenExpiration: Date,
//     createdAt: { type: Date, default: Date.now },
//     otp: String,
//     otpExpires: Date,
//     isVerified: { type: Boolean, default: true }
// }, { timestamps: true });

// module.exports = mongoose.model("User", UserSchema); // ✅ Export the model

// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // Hashed password
//   payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
//   balance: { type: Number, default: 0 },
//   stakes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stake" }],
//   totalEarnings: { type: Number, default: 0 },
//   withdrawableBalance: { type: Number, default: 0 },
//   resetToken: String,
//   resetTokenExpiration: Date,
//   otp: String,
//   otpExpires: Date,
//   isAdmin: {
//     type: Boolean,
//     default: false, // Default to false, will be true for admins
//   },
//   isVerified: { type: Boolean, default: true },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' } // Role field
// }, { timestamps: true });

// module.exports = mongoose.model("User", UserSchema);
// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   firstName: { type: String, required: false },
//   lastName: { type: String, required: false },
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: false },
//   country: { type: String, required: false },

//   password: { type: String }, // Only required for email/password auth
//   googleId: { type: String }, // Used for Google OAuth

//   payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
//   stakes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stake" }],

//   balance: { type: Number, default: 0 },
//   totalEarnings: { type: Number, default: 0 },
//   withdrawableBalance: { type: Number, default: 0 },

//   resetToken: String,
//   resetTokenExpiration: Date,
//   otp: String,
//   otpExpires: Date,

//   isAdmin: { type: Boolean, default: false },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' },
//   isVerified: { type: Boolean, default: false }
// }, { timestamps: true });

// module.exports = mongoose.model("User", UserSchema);
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // for Google-auth users
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  country: { type: String },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // leave blank for OAuth users
  balance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  withdrawableBalance: { type: Number, default: 0 },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  stakes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stake" }],
  resetToken: String,
  resetTokenExpiration: Date,
  otp: String,
  otpExpires: Date,
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  totalReward: { type: Number, default: 0 },
  referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
 
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
