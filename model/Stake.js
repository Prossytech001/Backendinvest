// const mongoose = require("mongoose");

// const StakeSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   amount: { type: Number, required: true },
//   plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true }, // or ObjectId if using Plan model
//   startDate: { type: Date, default: Date.now },
//   durationDays: { type: Number, default: 30 }, // example: 30-day plan
//   dailyROI: { type: Number, required: true }, // e.g., 0.05 for 5%
//   isCompleted: { type: Boolean, default: false },
// }, { timestamps: true });

// module.exports = mongoose.model("Stake", StakeSchema);
// const mongoose = require("mongoose");

// // ROI History Schema: Each day's earning record
// const roiHistorySchema = new mongoose.Schema({
//   date: { type: Date, required: true },
//   amount: { type: Number, required: true },
// });

// const StakeSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

//     amount: { type: Number, required: true }, // Amount staked

//     plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

//     startDate: { type: Date, default: Date.now },

//     durationDays: { type: Number, required: true }, // Duration in days

//     dailyROI: { type: Number, required: true }, // 0.05 = 5% daily

//     isCompleted: { type: Boolean, default: false }, // Auto-marked by cron later

//     totalEarnings: { type: Number, default: 0 }, // Running total ROI earned

//     roiHistory: [roiHistorySchema], // Stores history of daily ROI payouts

//     lastClaimDate: { type: String },


//   earningsSoFar: { type: Number, default: 0 }, // Total earned so far

//     endDate: { type: Date }, // Auto-calculated and saved on creation
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Stake", StakeSchema);
// ROI History Schema: Each day's earning record
const roiHistorySchema = new mongoose.Schema({
  date:   { type: String, required: true },  // "YYYY-MM-DD" (Lagos)
  amount: { type: Number, required: true },
  days:   { type: Number, default: 1 },      // optional but keeps your logs/data aligned
});

const StakeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },

    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    startDate: { type: Date, default: Date.now },

    durationDays: { type: Number, required: true },

    // IMPORTANT: your code treats dailyROI as a PERCENT (10 = 10%),
    // not a fraction (0.10). Keep using it as a percent to match the cron math.
    dailyROI: { type: Number, required: true }, // e.g. 10 for 10%

    isCompleted: { type: Boolean, default: false },

    totalEarnings: { type: Number, default: 0 },

    roiHistory: [roiHistorySchema],

    // Keep this as "YYYY-MM-DD" — matches cron math
    lastClaimDate: { type: String },

    earningsSoFar: { type: Number, default: 0 },

    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stake", StakeSchema);
