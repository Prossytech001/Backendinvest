// const mongoose = require("mongoose");
// const Plan = require("./model/Plan"); // adjust path if your Plan model is elsewhere
// require("dotenv").config();

// const plans = [
//   {
//     name: "Starter Plan",
//     minimumAmount: 0.001,
//     maximumAmount: 0.01,
//     dailyROI: 5,
//     duration: 30,
//   },
//   {
//     name: "Pro Plan",
//     minimumAmount: 0.01,
//     maximumAmount: 0.1,
//     dailyROI: 7,
//     duration: 30,
//   },
//   {
//     name: "Elite Plan",
//     minimumAmount: 0.1,
//     maximumAmount: 1,
//     dailyROI: 10,
//     duration: 30,
//   }
// ];

// mongoose.connect(process.env.MONGODB_URL).then(async () => {
//   try {
//     await Plan.deleteMany(); // Optional: wipe old plans
//     await Plan.insertMany(plans);
//     console.log("✅ Investment plans seeded successfully!");
//     process.exit();
//   } catch (error) {
//     console.error("❌ Error seeding plans:", error);
//     process.exit(1);
//   }
// });
require("dotenv").config();
const mongoose = require("mongoose");
const Plan = require("../Server/model/Plan"); // Adjust this if your path is different


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB connected");
  seedPlans();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

const plans = [
  {
    name: "Starter Plan",
    minInvestment: 100,
    maxInvestment: 499,
    dailyROI: 3, // 3% per day
    durationDays: 1,
    description: "Perfect for beginners who want to test the waters with a short, low-risk investment."
  },
  {
    name: "Pro Plan",
    minInvestment: 500,
    maxInvestment: 1999,
    dailyROI: 5, // 5% per day
    durationDays: 1,
    description: "Designed for growing investors looking for higher daily returns with manageable risk."
  },
  {
    name: "Elite Plan",
    minInvestment: 2000,
    maxInvestment: 10000,
    dailyROI: 8, // 8% per day
    durationDays: 1,
    description: "Best suited for experienced investors seeking premium returns on higher stakes."
  },
  {
    name: "Business Plan",
    minInvestment: 10000,
    maxInvestment: 50000,
    dailyROI: 10,
    durationDays: 7,
    description: "For businesses and high-net-worth individuals aiming for weekly profit growth."
  },
  {
    name: "Infinity Plan",
    minInvestment: 50000,
    maxInvestment: 100000,
    dailyROI: 12,
    durationDays: 14,
    description: "Maximum profit plan with elite support and bi-weekly high-performance ROI."
  } 
];

async function seedPlans() {
  try {
    await Plan.deleteMany(); // optional: clean old data
    await Plan.insertMany(plans);
    console.log("✅ Plans seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
}

