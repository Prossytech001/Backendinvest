// const mongoose = require('mongoose');

// const visitorSchema = new mongoose.Schema({
//   ip: String,
//   country: String,
//   region: String,
//   city: String,
//   isp: String,
//   browser: String,
 
//   browserVersion: String,
//   os: String,
//   osVersion: String,
//   deviceType: String,

//   userAgent: String,
//   timestamp: { type: Date, default: Date.now },
// });

// visitorSchema.index({ ip: 1, userAgent: 1 }, { unique: true });   

// module.exports = mongoose.model('Visitor', visitorSchema);
// model/Visitor.js
// const mongoose = require('mongoose');

// const visitorSchema = new mongoose.Schema({
//   email: { type: String, lowercase: true, trim: true },
//   ip: { type: String, index: true },
//   userAgent: String,
//   country: String,
//   region: String,
//   city: String,
//   isp: String,
//   browser: String,
//   browserVersion: String,
//   os: String,
//   osVersion: String,
//   deviceType: String,
//   timestamp: { type: Date, default: Date.now },
// });

// // Prevent duplicates by (ip, userAgent)
// visitorSchema.index({ ip: 1, userAgent: 1 }, { unique: true });

// module.exports = mongoose.model('Visitor', visitorSchema);
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  ip: { type: String, index: true },
  userAgent: String,
  country: String,
  region: String,
  city: String,
  isp: String,
  browser: String,
  browserVersion: String,
  os: String,
  osVersion: String,
  deviceType: String,
  timestamp: { type: Date, default: Date.now },
});

// Prevent duplicates by (ip, userAgent)
visitorSchema.index({ ip: 1, userAgent: 1 }, { unique: true });

module.exports = mongoose.model('Visitor', visitorSchema);
