

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../model/User");
const { route } = require("./adminRoutes");
const Activity = require('../model/Activity'); // Make sure this is correct
const { googleLogin } = require('../controllers/authController');


const router = express.Router();

const generateReferralCode = require('../utils/referral');

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // ✅ Accept self-signed certs
    },
  });
  

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer Error:", error);
  } else {
    console.log("✅ Nodemailer is ready to send emails!");
  }
});


// router.post("/signup", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.status(201).json({
//       message: "Signup successful",
//       token,
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//       },
//     });
//   } catch (error) {
//     console.error("Signup Error:", error);
//     res.status(500).json({ message: "Signup failed", error });
//   }
// });

router.post('/google', googleLogin);


// router.post("/signup", async (req, res) => {
//   try {
//     const { username, email, password ,referralCode: referredCode} = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     // Check if referredCode exists and fetch the referring user
//     let referredByUser = null;
//     if (referredCode) {
//   referredByUser = await User.findOne({ referralCode: referredCode });
//   if (!referredByUser) {
//     return res.status(400).json({ message: "Invalid referral code" });
//   }
// }


//     const hashedPassword = await bcrypt.hash(password, 10);


//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//      referralCode: await generateReferralCode(),

//       referredBy: referredByUser ? referredByUser._id : null,
//     });

//     // 🔥 Log signup activity
//     await Activity.create({
//       userId: newUser._id,
//       type: 'signup',
//       description: `${newUser.username} signed up`
//     });

//     const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.status(201).json({
//       message: "Signup successful",
//       token,
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//         referralLink: `${process.env.FRONTEND_URL}/signup?ref=${newUser.referralCode}`,
//       },
//     });
//   } catch (error) {
//     console.error("Signup Error:", error);
//     res.status(500).json({ message: "Signup failed", error });
//   }
// });
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    let referredByUser = null;
     if (referralCode) {
  referredByUser = await User.findOne({ referralCode });
  if (!referredByUser) {
    return res.status(400).json({ message: "Invalid referral code" });
  }
}

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      referralCode: await generateReferralCode(),
      referredBy: referredByUser ? referredByUser._id : null,
    });

    // 🟢 Update reward details for the referring user
    if (referredByUser) {
  referredByUser.totalReward = (referredByUser.totalReward || 0) + 50;
  referredByUser.referredUsers = referredByUser.referredUsers || [];
  referredByUser.referredUsers.push(newUser._id);
  await referredByUser.save();
}


    // 🔥 Log signup activity
    await Activity.create({
      userId: newUser._id,
      type: 'signup',
      description: `${newUser.username} signed up`,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${newUser.referralCode}`,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Signup failed", error });
  }
});



// routes/userRoutes.js
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.verified) {
      return res.status(400).send('User already verified');
    }

    // Mark the user as verified
    user.verified = true;
    await user.save();

    // Redirect or send success message
    return res.redirect('http://localhost:5173/dashboard'); // Or send JSON if it's an API
    // res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verification error:', err.message);
    return res.status(400).send('Invalid or expired token');
  }
});




router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Create a better token
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
    };

    await Activity.create({
      userId: user._id,
      type: 'login',
      description: `${user.username} logged in`
    });

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      token,
      user: payload, // ✅ Return user info to frontend immediately
      message: 'Login successful',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
