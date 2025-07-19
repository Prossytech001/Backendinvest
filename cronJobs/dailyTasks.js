
// export default dailyROIJob;
// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");

// // Run every day at 00:00
// cron.schedule("0 0 * * *", async () => {
//     console.log("Running cron job for daily ROI...");
//   try {
//     const activeStakes = await Stake.find({ isCompleted: false });

//     for (const stake of activeStakes) {
//       const today = new Date().toDateString();
//       const lastClaim = new Date(stake.lastClaimDate || stake.startDate).toDateString();

//       // Prevent duplicate crediting
//       if (today === lastClaim) continue;

//       const dailyEarning = (stake.amount * stake.dailyROI) / 100;
//       const user = await User.findById(stake.user);
//       if (!user) continue;

//       // Add daily ROI
//       stake.totalEarnings += dailyEarning;
//       stake.earningsSoFar += dailyEarning;
//       stake.lastClaimDate = new Date();
//       stake.roiHistory.push({ date: new Date(), amount: dailyEarning });

//       user.totalEarnings += dailyEarning;

//       // Check if stake duration is over
//       const endDate = new Date(stake.startDate);
//       endDate.setDate(endDate.getDate() + stake.durationDays);

//       if (new Date() >= endDate) {
//         // Complete the stake
//         stake.isCompleted = true;

//         // Move to withdrawable balance
//         user.withdrawableBalance += stake.totalEarnings;

//         // Optional: log activity
//         await new Activitys({
//           user: user._id,
//           type: 'Stake Completed',
//           amount: stake.totalEarnings,
//           description: `Plan completed. Earnings moved to withdrawable balance.`,
//         }).save();
//       }

//       await stake.save();
//       await user.save();
//     }

//     console.log("✅ Daily ROI processed successfully.");
//   } catch (err) {
//     console.error("❌ Error running daily ROI job:", err);
//   }
// });
// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");
// const Activitys = require("../model/Activity"); // if you have an activity log

// // Define the timezone
// const TIME_ZONE = "Africa/Lagos";

// // Helper function to format date in a timezone-safe way
// const formatDate = (date) =>
//   date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

// // Run the cron job every day at 00:00 in Lagos time
// cron.schedule(
//   "* * * * *",
//   async () => {
//     console.log("Running daily ROI job...");

//     try {
//       const activeStakes = await Stake.find({ isCompleted: false });

//       for (const stake of activeStakes) {
//         const today = formatDate(new Date());
//         const lastClaim = formatDate(
//           stake.lastClaimDate ? new Date(stake.lastClaimDate) : new Date(stake.startDate)
//         );

//         if (today === lastClaim) continue; // Already processed for today

//         const dailyEarning = (stake.amount * stake.dailyROI) / 100;

//         const user = await User.findById(stake.user);
//         if (!user) continue;

//         // Update stake record
//         stake.totalEarnings += dailyEarning;
//         stake.earningsSoFar += dailyEarning;
//         stake.lastClaimDate = new Date();
//         stake.roiHistory.push({ date: new Date(), amount: dailyEarning });

//         // Update user earnings
//         user.totalEarnings += dailyEarning;

//         // Check if staking duration has ended
//         const endDate = new Date(stake.startDate);
//         endDate.setDate(endDate.getDate() + stake.durationDays);

//         if (new Date() >= endDate) {
//           stake.isCompleted = true;
//           user.withdrawableBalance += stake.totalEarnings;

//           // Log activity
//           await new Activitys({
//             user: user._id,
//             type: "Stake Completed",
//             amount: stake.totalEarnings,
//             description: "Plan completed. Earnings moved to withdrawable balance.",
//           }).save();
//         }

//         await stake.save();
//         await user.save();
//       }

//       console.log("✅ Daily ROI processed.");
//     } catch (err) {
//       console.error("❌ Error in daily ROI job:", err);
//     }
//   },
//   {
//     timezone: TIME_ZONE,
//   }
// );
// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");
// const Activitys = require("../model/Activity");

// const TIME_ZONE = "Africa/Lagos";

// const formatDate = (date) =>
//   date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

// cron.schedule(
//   "0 0 * * *", // Runs every day at 00:00
//   async () => {
//     console.log("Running daily ROI job...");

//     try {
//       const activeStakes = await Stake.find({ isCompleted: false });

//       for (const stake of activeStakes) {
//         const today = new Date();
//         const todayFormatted = formatDate(today);
//         const lastClaimFormatted = formatDate(
//           stake.lastClaimDate ? new Date(stake.lastClaimDate) : new Date(stake.startDate)
//         );

//         if (todayFormatted === lastClaimFormatted) continue; // Already processed today

//         const endDate = new Date(stake.startDate);
//         endDate.setDate(endDate.getDate() + stake.durationDays);
//         const isEndingToday = formatDate(endDate) === todayFormatted;

//         const user = await User.findById(stake.user);
//         if (!user) continue;

//         if (isEndingToday) {
//           // Finalize the stake without adding today's ROI again
//           stake.isCompleted = true;
//           user.withdrawableBalance += stake.totalEarnings;

//           await new Activitys({
//             user: user._id,
//             type: "Stake Completed",
//             amount: stake.totalEarnings,
//             description: "Plan completed. Earnings moved to withdrawable balance.",
//           }).save();

//           await stake.save();
//           await user.save();
//           continue; // Skip adding ROI for the final day
//         }

//         // Add daily ROI
//         const dailyEarning = (stake.amount * stake.dailyROI) / 100;
//         stake.totalEarnings += dailyEarning;
//         stake.earningsSoFar += dailyEarning;
//         stake.lastClaimDate = today;
//         stake.roiHistory.push({ date: today, amount: dailyEarning });

//         user.totalEarnings += dailyEarning;

//         await stake.save();
//         await user.save();
//       }

//       console.log("✅ Daily ROI processed.");
//     } catch (err) {
//       console.error("❌ Error in daily ROI job:", err);
//     }
//   },
//   {
//     timezone: TIME_ZONE,
//   }
// );
// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");
// const mongoose = require("mongoose");

// const TIME_ZONE = "Africa/Lagos"; // Or any valid TZ string
// const IS_TEST_MODE = process.env.ROI_TEST_MODE === "true";

// cron.schedule("* * * * *", async () => {
//   try {
//     console.log(`[${new Date().toISOString()}] Running ROI cron...`);

//     const activeStakes = await Stake.find({ isCompleted: false });

//     for (const stake of activeStakes) {
//       const now = new Date();
//       const lastClaim = new Date(stake.lastClaimDate || stake.startDate);
//       const endDate = new Date(stake.startDate);

//       // For testing, use minutes instead of days
//       if (IS_TEST_MODE) {
//         endDate.setMinutes(endDate.getMinutes() + stake.durationDays);
//       } else {
//         endDate.setDate(endDate.getDate() + stake.durationDays);
//       }

//       const isEndingToday = now.toISOString().slice(0, 16) === endDate.toISOString().slice(0, 16);
//       const hasClaimedToday = lastClaim.toISOString().slice(0, 16) === now.toISOString().slice(0, 16);

//       const roiToday = stake.amount * (stake.dailyROI / 100);

//       if (isEndingToday) {
//         if (!stake.isCompleted) {
//           // Plan ends today: move all earnings and close
//           stake.isCompleted = true;
//           stake.endDate = endDate;
//           stake.roiHistory.push({ date: now, amount: roiToday });
//           stake.earningsSoFar += roiToday;
//           stake.totalEarnings = stake.earningsSoFar;
//           stake.lastClaimDate = now;

//           const user = await User.findById(stake.user);
//           user.withdrawableBalance += stake.totalEarnings;
//           await user.save();

//           await stake.save();
//           console.log(`Stake ${stake._id} completed. Final ROI added.`);
//         }
//         continue; // Skip further ROI addition
//       }

//       if (!hasClaimedToday && now < endDate) {
//         stake.roiHistory.push({ date: now, amount: roiToday });
//         stake.earningsSoFar += roiToday;
//         stake.totalEarnings = stake.earningsSoFar;
//         stake.lastClaimDate = now;

//         await stake.save();
//         console.log(`Added ROI for stake ${stake._id}`);
//       }
//     }
//   } catch (err) {
//     console.error("Cron error:", err.message);
//   }
//   // === TEMP TESTING: Add ROI to user's balance instead of totalEarnings ===
// // for (const stake of activeStakes) {
// //   const user = await User.findById(stake.user);

// //   const roiAmount = parseFloat(((stake.amount * stake.dailyROI) / 100).toFixed(2));
// //   user.balance += roiAmount;
// //   await user.save();

// //   console.log(`✅ Test: Added ROI ${roiAmount} to user ${user.username}'s balance`);
// // }
// // === END TESTING SECTION ===

// }, {
//   timezone: TIME_ZONE,
// });

// const cron = require("node-cron");
// const Stake = require("../model/Stake");
// const User = require("../model/User");
// const Activitys = require("../model/Activity");

// const TIME_ZONE = "Africa/Lagos";

// const formatDate = (date) =>
//   date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

// cron.schedule(
//   "0 0 * * *", // Every day at midnight
//   async () => {
//     console.log("Running daily ROI job...");

//     try {
//       const activeStakes = await Stake.find({ isCompleted: false });

//       for (const stake of activeStakes) {
//         const today = new Date();
//         const todayFormatted = formatDate(today);
//         const lastClaimFormatted = formatDate(
//           stake.lastClaimDate ? new Date(stake.lastClaimDate) : new Date(stake.startDate)
//         );

//         if (todayFormatted === lastClaimFormatted) continue; // Already credited today

//         const endDate = new Date(stake.startDate);
//         endDate.setDate(endDate.getDate() + stake.durationDays);
//         const isEndingToday = formatDate(endDate) === todayFormatted;

//         const user = await User.findById(stake.user);
//         if (!user) continue;

//         // Calculate today's earning
//         const dailyEarning = (stake.amount * stake.dailyROI) / 100;

//         // Apply today's ROI
//         stake.totalEarnings += dailyEarning;
//         stake.earningsSoFar += dailyEarning;
//         stake.lastClaimDate = today;
//         stake.roiHistory.push({ date: today, amount: dailyEarning });

//         user.totalEarnings += dailyEarning;

//         // Defensive checks before ROI calculation
// if (
//   typeof stake.amount !== "number" || isNaN(stake.amount) ||
//   typeof stake.dailyROI !== "number" || isNaN(stake.dailyROI)
// ) {
//   console.warn(`❌ Invalid stake values for stake ${stake._id}. Skipping.`);
//   continue;
// }


//         // If plan ends today, mark as completed and transfer to withdrawableBalance
//         if (isEndingToday) {
//           stake.isCompleted = true;
//           user.withdrawableBalance += stake.totalEarnings;

//           await new Activitys({
//             user: user._id,
//             type: "Stake Completed",
//             amount: stake.totalEarnings,
//             description: "Plan completed. Earnings moved to withdrawable balance.",
//           }).save();
//         }

//         await stake.save();
//         await user.save();
//       }

//       console.log("✅ Daily ROI processed.");
//     } catch (err) {
//       console.error("❌ Error in daily ROI job:", err);
//     }
//   },
//   {
//     timezone: TIME_ZONE,
//   }
// );
const cron = require('node-cron');
const Stake = require('../model/Stake');
const User = require('../model/User');
const mongoose = require('mongoose');

cron.schedule('0 0 * * *', async () => {
  console.log('🟢 Running daily ROI cron job');

  try {
    const stakes = await Stake.find({ isCompleted: false }).populate('user');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    for (const stake of stakes) {
      const user = stake.user;

      if (!user) {
        console.warn(`⚠️ Stake ${stake._id} has no associated user`);
        continue;
      }

      // Defensive checks
      if (
        typeof stake.amount !== 'number' || isNaN(stake.amount) ||
        typeof stake.dailyROI !== 'number' || isNaN(stake.dailyROI)
      ) {
        console.warn(`⚠️ Invalid stake data for stake ${stake._id}. Skipping...`);
        continue;
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const dailyEarning = parseFloat(((stake.amount * stake.dailyROI) / 100).toFixed(2));

        // Update stake earnings
        stake.totalEarnings = (stake.totalEarnings || 0) + dailyEarning;
        stake.earningsSoFar = (stake.earningsSoFar || 0) + dailyEarning;
        stake.lastClaimDate = today;
        stake.roiHistory.push({ date: today, amount: dailyEarning });

        // Update user earnings
        user.totalEarnings = (user.totalEarnings || 0) + dailyEarning;

        // Check if the stake has matured
        const now = new Date();
        const endDate = new Date(stake.endDate);
        if (now >= endDate && !stake.isCompleted) {
          stake.isCompleted = true;
          user.withdrawableBalance = (user.withdrawableBalance || 0) + stake.totalEarnings;
        }

        await stake.save({ session });
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        console.log(`✅ ROI added for stake ${stake._id} (User: ${user.email})`);
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(`❌ Transaction failed for stake ${stake._id}:`, err);
      }
    }
  } catch (err) {
    console.error('❌ Error in ROI cron job:', err);
  }
});
