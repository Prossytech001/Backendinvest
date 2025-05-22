// const express = require("express");
// const router = express.Router();
// const Stake = require("../model/Stake");
// const Plan = require("../model/Plan");
// const User = require("../model/User");
// const { protect } = require("../middleware/authMiddleware");

// // @route   POST /api/stakes/create
// // @desc    Create a new stake
// // @access  Private
// router.post("/create", protect, async (req, res) => {
//   try {
//     const { planId, amount } = req.body;

//     if (!planId || !amount) {
//       return res.status(400).json({ message: "Plan ID and amount are required." });
//     }

//     // Find the plan details
//     const plan = await Plan.findById(planId);
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found." });
//     }

//     // Calculate daily ROI based on plan's ROI and duration
//     const dailyROI = plan.roi / plan.durationDays;

//     // Create the stake
//     const newStake = await Stake.create({
//       user: req.user._id,
//       amount,
//       plan: plan._id,
//       dailyROI,
//       durationDays: plan.durationDays,
//     });

//     res.status(201).json({ message: "Stake created successfully!", stake: newStake });
//   } catch (err) {
//     console.error("Error creating stake:", err.message);
//     res.status(500).json({ message: "Server error. Try again later." });
//   }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const Stake = require("../models/Stake");
// const Plan = require("../models/Plan");
// const { protect } = require("../middleware/authMiddleware");// 🛡️ Import middleware

// // 🟢 Create stake route
// router.post("/create", protect, async (req, res) => {
//   try {
//     const { amount, plan, dailyROI } = req.body;
//     const userId = req.user.userId; // ✅ Comes from decoded token

//     if (!amount || !plan || !dailyROI) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const selectedPlan = await Plan.findById(plan);
//     if (!selectedPlan) {
//       return res.status(400).json({ message: "Invalid plan" });
//     }

//     const newStake = new Stake({
//       user: userId,
//       amount,
//       plan,
//       dailyROI,
//       durationDays: selectedPlan.durationDays,
//     });

//     await newStake.save();

//     res.status(201).json({ message: "Stake created successfully", stake: newStake });
//   } catch (error) {
//     console.error("Stake creation error:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const Stake = require("../model/Stake");
// const Plan = require("../model/Plan");
// const { protect } = require("../middleware/authMiddleware"); // Adjust path if needed

// // @route POST /api/stakes/create
// // @desc  Create a new stake
// // @access Private
// router.post("/create", protect, async (req, res) => {
//   try {
//     const { amount, plan, dailyROI } = req.body;

//     if (!amount || !plan || !dailyROI) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const selectedPlan = await Plan.findById(plan);
//     if (!selectedPlan) {
//       return res.status(400).json({ message: "Invalid plan" });
//     }

//     const newStake = new Stake({
//       user: req.user._id, // From middleware
//       amount,
//       plan,
//       dailyROI,
//       durationDays: selectedPlan.durationDays,
//     });

//     await newStake.save();

//     res.status(201).json({
//       message: "Stake created successfully",
//       stake: newStake,
//     });
//   } catch (error) {
//     console.error("Error creating stake:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const Stake = require("../model/Stake");
// const Plan = require("../model/Plan");
// const { protect } = require("../middleware/authMiddleware");

// // @route   POST /api/stakes/create
// // @desc    Create a new stake
// // @access  Private
// router.post("/create", protect, async (req, res) => {
//   const { amount, plan: planId, dailyROI } = req.body;

//   try {
//     const user = req.user;

//     // 1. Validate amount
//     if (!amount || isNaN(amount) || amount <= 0) {
//       return res.status(400).json({ message: "Invalid amount" });
//     }

//     // 2. Fetch the plan
//     const plan = await Plan.findById(planId);
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     // 3. Check if user has enough balance
//     if (user.balance < amount) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // 4. Calculate maturity and ROI values
//     const dailyReturn = amount * plan.dailyROI;
//     const maturityDate = new Date();
//     maturityDate.setDate(maturityDate.getDate() + plan.durationDays);

//     // 5. Create stake
//     const stake = await Stake.create({
//       user: user._id,
//       amount,
//       plan: plan._id,
//       dailyROI: plan.dailyROI,
//       durationDays: plan.durationDays,
//       startDate: new Date(),
//     });

//     // 6. Deduct balance and save user
//     user.balance -= amount;
//     user.stakes.push(stake._id);
//     await user.save();

//     res.status(201).json({
//       message: "Stake created successfully",
//       stake,
//       newBalance: user.balance,
//     });
//   } catch (err) {
//     console.error("Error creating stake:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }

//   if (amount < plan.minInvestment || amount > plan.maxInvestment) {
//     return res.status(400).json({ message: `Amount must be between ${plan.minInvestment} and ${plan.maxInvestment}` });
//   }
  

// });

// router.get("/mine", protect, async (req, res) => {
//     try {
//       const stakes = await Stake.find({ user: req.user._id })
//         .populate("plan") // includes plan details
//         .sort({ createdAt: -1 });
  
//       res.status(200).json(stakes);
//     } catch (error) {
//       console.error("Error fetching user stakes:", error.message);
//       res.status(500).json({ message: "Failed to fetch stakes" });
//     }
//   });


// module.exports = router;


// routes/stake.js
const express = require("express");
const User = require("../model/User");
const Stake = require("../model/Stake");
 const Plan = require("../model/Plan");
 const { protect } = require("../middleware/authMiddleware");
 const { claimDailyROI } = require("../controllers/stakeController");
 const Activity = require("../model/Activity");
 const Activitys = require("../model/Activitys");

const router = express.Router();

// @route   POST /api/stakes/claim-daily
router.post("/claim-daily", protect, claimDailyROI);

router.post("/create", protect, async (req, res) => {
    const { amount, plan: planId } = req.body;
  
    try {
      const user = req.user;
  
      // 1. Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
  
      // 2. Fetch plan
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
  
      // 3. Validate amount within plan range
      if (amount < plan.minInvestment || amount > plan.maxInvestment) {
        return res.status(400).json({
          message: `Amount must be between ${plan.minInvestment} and ${plan.maxInvestment}`,
        });
      }
  
      // 4. Check user balance
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
  
      // 5. Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.durationDays);
  
      // 6. Create stake with updated schema
      const stake = await Stake.create({
        user: user._id,
        amount,
        plan: plan._id,
        dailyROI: plan.dailyROI,
        durationDays: plan.durationDays,
        startDate,
        endDate,
        roiHistory: [], // Initially empty
        totalEarned: 0, // Starts from zero
        isCompleted: false,
      });
  
      // 7. Update user balance and add stake ID
      user.balance -= amount;
      user.stakes.push(stake._id);
      await user.save();

      await Activity.create({
            userId: user._id,
            type: 'stake',
            stakeId: stake._id,
            description: `${user.username} created a stake of ₦${amount} in the ${plan.name} plan.`,
          });
          await new Activitys({
  user: req.user.id,
  type: 'Stake Created',
  amount: amount,
  plan: planId,
}).save();

  
      res.status(201).json({
        message: "Stake created successfully",
        stake,
        newBalance: user.balance,
      });
    } catch (err) {
      console.error("Error creating stake:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  });
  
router.get("/mine", protect, async (req, res) => {
    try {
      const userId = req.user.id; // Assuming verifyToken sets req.user
      const stakes = await Stake.find({ user: userId });
      res.json(stakes);
    } catch (error) {
      console.error("Error fetching user stakes:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  router.get('/my-stakes', protect, async (req, res) => {
    try {
      const stakes = await Stake.find({ user: req.user.id }).populate('plan');
      res.status(200).json(stakes);
    } catch (err) {
      console.error("Error fetching user stakes:", err);
      res.status(500).json({ message: "Failed to fetch stakes." });
    }
  });

  // POST /api/stakes/:stakeId/claim
router.post("/:stakeId/claim", protect, async (req, res) => {
  try {
    const stake = await Stake.findById(req.params.stakeId);
    if (!stake) return res.status(404).json({ message: "Stake not found" });
    if (stake.isCompleted) return res.status(400).json({ message: "This stake is already completed" });

    const today = new Date().toDateString();
    const lastClaim = new Date(stake.lastClaimDate || stake.startDate).toDateString();

    if (today === lastClaim) {
      return res.status(400).json({ message: "Already claimed today" });
    }

    const user = await User.findById(stake.user);
    const dailyEarning = (stake.amount * stake.dailyROI) / 100;

    stake.earningsSoFar += dailyEarning;
    stake.totalEarnings += dailyEarning;
    stake.lastClaimDate = new Date();
    stake.roiHistory.push({ date: new Date(), amount: dailyEarning });
    await stake.save();

    user.totalEarnings += dailyEarning;
    await user.save();

    await new Activitys({
      user: user._id,
      type: 'Daily ROI Claimed',
      amount: dailyEarning,
      description: `Claimed ROI from stake ₦${stake.amount}`,
    }).save();

    res.status(200).json({
      message: "ROI claimed successfully!",
      stake,
      userTotals: {
        totalEarnings: user.totalEarnings,
        withdrawableBalance: user.withdrawableBalance,
      },
    });

  } catch (err) {
    console.error("Stake ROI claim failed:", err);
    res.status(500).json({ message: "Failed to claim ROI for this stake" });
  }
});


module.exports = router;

