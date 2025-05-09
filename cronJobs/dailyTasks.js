// // cronJobs/dailyTasks.js
// const cron = require("node-cron");
// const Stake = require("../models/Stake");
// const User = require("../models/User");

// // Run once every day at midnight
// cron.schedule("0 0 * * *", async () => {
//   console.log("⏰ Running daily stake update...");

//   try {
//     const stakes = await Stake.find({});

//     for (let stake of stakes) {
//       const createdAt = new Date(stake.createdAt);
//       const now = new Date();
//       const daysPassed = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

//       if (daysPassed < stake.durationDays) {
//         const roi = stake.amount * stake.dailyROI;

//         await User.findByIdAndUpdate(stake.user, {
//           $inc: { balance: roi },
//         });

//         console.log(
//           `Credited ROI of ${roi} to user ${stake.user} for stake ${stake._id}`
//         );
//       } else {
//         console.log(`Stake ${stake._id} has matured.`);
//         // You could optionally mark it as 'completed' in DB
//       }
//     }
//   } catch (err) {
//     console.error("Error in daily task:", err.message);
//   }
// });

// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");

// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Running daily ROI payout...");

//   try {
//     const activeStakes = await Stake.find({ isCompleted: false });

//     for (let stake of activeStakes) {
//       const createdAt = new Date(stake.createdAt);
//       const now = new Date();
//       const daysPassed = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

//       if (daysPassed < stake.durationDays) {
//         const roi = stake.amount * stake.dailyROI;

//         await User.findByIdAndUpdate(stake.user, {
//           $inc: { balance: roi },
//         });

//         console.log(`Credited ${roi} to user ${stake.user}`);
//       }

//       if (daysPassed >= stake.durationDays) {
//         stake.isCompleted = true;
//         await stake.save();
//         console.log(`Stake ${stake._id} marked as completed.`);
//       }
//     }
//   } catch (error) {
//     console.error("Cron job error:", error.message);
//   }
// });
// cron/roiJob.js
// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");

// // Runs every day at midnight
// cron.schedule("* * * * *", async () => {
//   console.log("Running daily ROI job...");

//   try {
//     const activeStakes = await Stake.find({ status: "active" });

//     for (const stake of activeStakes) {
//       // Only process if the stake hasn't matured
//       const start = new Date(stake.createdAt);
//       const now = new Date();
//       const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));

//       if (daysPassed < stake.durationDays) {
//         const dailyROI = stake.amount * stake.dailyROI;

//         // Update user earnings
//         await User.findByIdAndUpdate(stake.user, {
//           $inc: { totalEarnings: dailyROI },
//         });
//       }

//       // After maturity, move total earnings to withdrawable balance
//       if (daysPassed === stake.durationDays) {
//         const totalReturn = stake.amount * stake.dailyROI * stake.durationDays;

//         await User.findByIdAndUpdate(stake.user, {
//           $inc: {
//             withdrawableBalance: totalReturn,
//           },
//         });

//         stake.status = "completed";
//         await stake.save();
//       }
//     }

//     console.log("ROI job completed.");
//   } catch (error) {
//     console.error("Error running ROI job:", error.message);
//   }
// });

// cronJobs/stakeEarnings.js
// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");

// // Runs every day at midnight
// cron.schedule("0 0 * * *", async () => {
//   console.log("🔁 Running daily staking ROI job...");

//   try {
//     const activeStakes = await Stake.find({ completed: false }).populate("user");

//     for (const stake of activeStakes) {
//       const { amount, dailyROI, durationDays, startDate, earnedSoFar, user } = stake;
//       const now = new Date();
//       const elapsedDays = Math.floor((now - new Date(startDate)) / (1000 * 60 * 60 * 24));

//       // If already matured, mark complete and move earnings ONCE
//       if (elapsedDays >= durationDays) {
//         stake.completed = true;
//         user.withdrawableBalance += stake.earnedSoFar;
//         await stake.save();
//         await user.save();
//         continue; // skip the rest of the loop
//       }

//       // Otherwise, continue accumulating daily ROI
//       const dailyEarning = amount * dailyROI;
//       stake.earnedSoFar += dailyEarning;
//       user.totalEarnings += dailyEarning;

//       await stake.save();
//       await user.save();
//     }

//     console.log("✅ Daily staking ROI job completed.");
//   } catch (err) {
//     console.error("❌ Error running staking ROI job:", err.message);
//   }
// });

// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");

// const TEST_MODE = true; // Toggle this to switch between testing and production

// cron.schedule("0 0 * * *", async () => {
//   console.log("🔁 Running staking ROI job...");

//   try {
//     const activeStakes = await Stake.find({ completed: false }).populate("user");

//     for (const stake of activeStakes) {
//       const { amount, dailyROI, durationDays, startDate, user } = stake;

//       const now = new Date();
//       const start = new Date(startDate);

//       const elapsed = TEST_MODE
//         ? Math.floor((now - start) / (1000 * 60)) // minutes
//         : Math.floor((now - start) / (1000 * 60 * 60 * 24)); // days

//       const duration = TEST_MODE
//         ? durationDays // simulate: 1 day = 1 minute
//         : durationDays;

//       if (elapsed >= duration) {
//         stake.completed = true;
//         user.withdrawableBalance += stake.earnedSoFar;
//         await stake.save();
//         await user.save();
//         continue;
//       }

//       const earning = amount * dailyROI; // simulate full daily earning

//       stake.earnedSoFar += earning;
//       user.totalEarnings += earning;

//       await stake.save();
//       await user.save();

//       console.log(`🟢 Updated ${user.email}: +$${earning.toFixed(2)}`);
//     }

//     console.log("✅ ROI job done.");
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// });


import cron from "node-cron";
import Stake from "../model/Stake.js";
import User from "../model/User.js";

const dailyROIJob = cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily ROI distribution...");

  const activeStakes = await Stake.find({ isCompleted: false });

  for (const stake of activeStakes) {
    const user = await User.findById(stake.user);
    if (!user) continue;

    // Calculate days passed
    const startDate = new Date(stake.startDate);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    // Check if staking duration is over
    if (daysPassed >= stake.durationDays) {
      // Move full ROI to withdrawableBalance
      user.withdrawableBalance += stake.earningsSoFar;
      stake.isCompleted = true;
      await stake.save();
      await user.save();
      continue;
    }

    // Credit daily ROI
    const dailyEarning = stake.amount * stake.dailyROI / 100;
    stake.earningsSoFar += dailyEarning;
    user.totalEarnings += dailyEarning;

    await stake.save();
    await user.save();
  }

  console.log("✅ Daily ROI processing completed");
});

export default dailyROIJob;
