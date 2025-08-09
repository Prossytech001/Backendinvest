// routes/email-only.js
const express = require('express');
const router = express.Router();
const EmailOnly = require('../model/EmailOnly');

router.post('/', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const doc = await EmailOnly.findOneAndUpdate(
      { email },
      { $setOnInsert: { email } }, // only create if new
      { upsert: true, new: true }
    );

    return res.status(200).json({ ok: true, id: doc._id, email: doc.email });
  } catch (err) {
    if (err?.code === 11000) return res.status(200).json({ ok: true, duplicate: true });
    console.error('email-only error:', err);
    return res.sendStatus(500);
  }
});

// (Optional) list emails for admin/export
router.get('/', async (_req, res) => {
  const items = await EmailOnly.find().sort({ createdAt: -1 }).select('email createdAt');
  res.json(items);
});

module.exports = router;
