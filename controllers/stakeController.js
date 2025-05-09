// const Stake = require("../model/Stake");
// const User = require("../model/User");

// exports.claimDailyROI = async (req, res) => {
//   try {
//     const userId = req.user.id; // From auth middleware
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const stakes = await Stake.find({ user: userId, isCompleted: false });

//     let totalClaimedToday = 0;

//     const today = new Date();
//     for (const stake of stakes) {
//       const lastClaim = stake.lastClaimDate || new Date(stake.startDate);
//       const daysPassed = Math.floor((today - new Date(stake.startDate)) / (1000 * 60 * 60 * 24));

//       if (stake.isCompleted || daysPassed >= stake.durationDays) {
//         // Complete the plan if time passed
//         user.withdrawableBalance += stake.earningsSoFar;
//         stake.isCompleted = true;
//         await stake.save();
//         await user.save();

//         continue;
//       }

//       const lastClaimDay = new Date(lastClaim).toDateString();
//       const todayStr = today.toDateString();
//       if (lastClaimDay === todayStr) {
//         continue; // Already claimed today
//       }

//       // Get daily ROI from plan
//       const dailyROI = stake.dailyROI;
//       const dailyEarning = stake.amount * dailyROI / 100;

//       // Update stake
//       stake.earningsSoFar += dailyEarning;
//       stake.totalEarnings += dailyEarning;
//       stake.lastClaimDate = today;
//       stake.roiHistory.push({ date: today, amount: dailyEarning });
//       await stake.save();

//       // Update user earnings
//       user.totalEarnings += dailyEarning;
//       totalClaimedToday += dailyEarning;
//     }

//     await user.save();

//     res.status(200).json({
//       message: `You've earned ₦${totalClaimedToday.toFixed(2)} in ROI today!`,
//       claimedAmount: totalClaimedToday
//     });
//   } catch (err) {
//     console.error("Error claiming daily ROI:", err);
//     res.status(500).json({ message: "Something went wrong while claiming ROI" });
//   }
// };
const Stake = require("../model/Stake");
const User = require("../model/User");

exports.claimDailyROI = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 Fetch all stakes, not just incomplete ones
    const stakes = await Stake.find({ user: userId });

    let totalClaimedToday = 0;
    const today = new Date();

    for (const stake of stakes) {
      const lastClaim = stake.lastClaimDate || new Date(stake.startDate);
      const daysPassed = Math.floor((today - new Date(stake.startDate)) / (1000 * 60 * 60 * 24));

      // ✅ Complete the plan if time passed
      if (!stake.isCompleted && daysPassed >= stake.durationDays) {
        if (stake.earningsSoFar > 0) {
          user.withdrawableBalance += stake.earningsSoFar;
          stake.earningsSoFar = 0;
        }
        stake.isCompleted = true;
        await stake.save();
        await user.save();
        continue; // Completed, skip daily ROI
      }

      if (stake.isCompleted) {
        if (stake.earningsSoFar > 0) {
          user.withdrawableBalance += stake.earningsSoFar;
          stake.earningsSoFar = 0;
          await stake.save();
          await user.save();
        }
        continue;
      }

      if (totalClaimedToday === 0) {
        return res.status(200).json({
          message: "You've already claimed your ROI today or all your plans are completed.",
          claimedAmount: 0,
          withdrawableBalance: user.withdrawableBalance.toFixed(2)
        });
      }
      
      

      const lastClaimDay = new Date(lastClaim).toDateString();
      const todayStr = today.toDateString();
      if (lastClaimDay === todayStr) continue; // Already claimed today
      
      // ROI logic
      const dailyROI = stake.dailyROI;
      const dailyEarning = (stake.amount * dailyROI) / 100;

      stake.earningsSoFar += dailyEarning;
      stake.totalEarnings += dailyEarning;
      stake.lastClaimDate = today;
      stake.roiHistory.push({ date: today, amount: dailyEarning });
      await stake.save();

      user.totalEarnings += dailyEarning;
      totalClaimedToday += dailyEarning;
    }

    await user.save();

    res.status(200).json({
      message: `You've earned ₦${totalClaimedToday.toFixed(2)} in ROI today!`,
      claimedAmount: totalClaimedToday,
      withdrawableBalance: user.withdrawableBalance.toFixed(2)
    });
  } catch (err) {
    console.error("Error claiming daily ROI:", err);
    res.status(500).json({ message: "Something went wrong while claiming ROI" });
  }
};
