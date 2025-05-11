

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../model/User");

const router = express.Router();

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

// ✅ This must be outside any other route
// router.get("/test-email", async (req, res) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: "your_real_email@gmail.com", // Replace with your test email
//       subject: "✅ Test Email from Crypto App",
//       text: "You're all set! This is a test email.",
//     });

//     res.send("✅ Test email sent successfully!");
//   } catch (err) {
//     console.error("❌ Email send error:", err);
//     res.status(500).send("❌ Failed to send test email");
//   }
// });





// ✅ Signup route with email verification
// router.post("/signup", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       verificationToken,
//       isVerified: false,
//     });

//     const verificationURL = `http://localhost:5000/api/users/verify/${token}`;


//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Verify Your Email",
//       html: `
//         <h3>Hello ${username},</h3>
//         <p>Click the button below to verify your email and access your dashboard:</p>
//         <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background-color: green; color: white; border-radius: 4px; text-decoration: none;">Verify Email</a>
//         <p>This link expires in 10 minutes.</p>
//       `,
//     });

//     res.status(201).json({ message: "Signup successful. Please check your email to verify." });
//   } catch (error) {
//     console.error("Signup Error:", error);
//     res.status(500).json({ message: "Signup failed", error });
//   }
// });

// ✅ Email verification route
// router.post("/verify-link", async (req, res) => {
//   const { token } = req.body;

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({ email: decoded.email });

//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.isVerified) return res.status(400).json({ message: "User already verified" });

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     await user.save();

//     res.status(200).json({ message: "Email verified successfully" });
//   } catch (error) {
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// });

// router.post("/signup", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate email verification token
//     const token = jwt.sign(
//       { userId: email._id, email },
//       process.env.JWT_SECRET,
//       { expiresIn: "10m" }
//     );

//     // Create user (with isVerified = false)
//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       isVerified: false
//     });

//     // Construct verification URL
//     const verificationURL = `http://localhost:5000/api/users/verify/${token}`;

//     // Send verification email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Verify Your Email",
//       html: `
//         <h3>Hello ${username},</h3>
//         <p>Click the button below to verify your email and access your dashboard:</p>
//         <a href="${verificationURL}" target="_blank" style="padding: 10px 20px; background-color: green; color: white; border-radius: 4px; text-decoration: none;">Verify Email</a>
//         <p>This link expires in 10 minutes.</p>
//       `,
//     });

//     res.status(201).json({ message: "Signup successful. Please check your email to verify." });

//   } catch (error) {
//     console.error("Signup Error:", error);
//     res.status(500).json({ message: "Signup failed", error });
//   }
// });

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
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


// ✅ Login route
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!user.isVerified) return res.status(401).json({ message: "Please verify your email first" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.status(200).json({ message: "Login successful", token, user });
//   } catch (error) {
//     res.status(500).json({ message: "Login failed", error });
//   }
// });
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     // 🔓 No more verification check
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Login failed", error });
//   }
// });

// console.log("JWT_SECRET:", process.env.JWT_SECRET);


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
