// const mongoose = require("mongoose");

// const PlanSchema = new mongoose.Schema({
//   name: { type: String, required: true },       // e.g., "Silver Plan"
//   durationDays: { type: Number, required: true }, // e.g., 30
//   dailyROI: { type: Number, required: true },     // e.g., 0.05 for 5%
//   minAmount: { type: Number, default: 0 },
//   maxAmount: { type: Number },                   // optional
//   description: { type: String },                 // for frontend display
// }, { timestamps: true });

// module.exports = mongoose.model("Plan", PlanSchema);
const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minInvestment: { type: Number, required: true },
  maxInvestment: { type: Number, required: true },
  dailyROI: { type: Number, required: true },
  description: {
    type: String,
    required: true,
  },
  durationDays: { type: Number, required: true }, // ✅ Make sure this is in your model
});

module.exports = mongoose.model("Plan", planSchema);
