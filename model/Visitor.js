const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: String,
  country: String,
  region: String,
  city: String,
  isp: String,
  browser: String,
browserVersion: String,
os: String,
osVersion: String,
deviceType: String,

  userAgent: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visitor', visitorSchema);
