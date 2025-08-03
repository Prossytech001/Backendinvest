const express = require("express");
const router = express.Router();
const Plan = require("../model/Plan");

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error("Failed to fetch plans:", err);
    res.status(500).send("Server error");
  }
});

// Create new plan
router.post("/", async (req, res) => {
  try {
    const newPlan = await Plan.create(req.body);
    res.status(201).json(newPlan);
  } catch (err) {
    console.error("Failed to create plan:", err);
    res.status(500).send("Server error");
  }
});

// Update plan
router.put("/:id", async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedPlan) return res.status(404).send("Plan not found");
    res.json(updatedPlan);
  } catch (err) {
    console.error("Failed to update plan:", err);
    res.status(500).send("Server error");
  }
});

// Delete plan
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Plan.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send("Plan not found");
    res.sendStatus(204); // No content
  } catch (err) {
    console.error("Failed to delete plan:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
