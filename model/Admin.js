const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: true }, // ✅ REQUIRED
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
