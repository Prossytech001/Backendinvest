// models/EmailOnly.js
const mongoose = require('mongoose');

const emailOnlySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailOnly', emailOnlySchema);
