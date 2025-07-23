const Plan = require("../model/Plan"); 
const express = require('express');
const router = express.Router();


// GET all investment plans
// router.get('/', async (req, res) => {
//   try {
//     const plans = await Plan.find();
//     res.json(plans);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch plans" });
//   }
// });

router.get('/', async (req, res) => {
  console.log("GET /api/plans hit");
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    console.error("Failed to fetch plans", error);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
});

module.exports = router;