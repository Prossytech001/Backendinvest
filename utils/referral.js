const User = require('../model/User');

async function generateReferralCode() {
  let code;
  let existing;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    existing = await User.findOne({ referralCode: code });
  } while (existing);
  return code;
}

module.exports = generateReferralCode;
