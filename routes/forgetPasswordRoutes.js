// const express = require('express');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const User = require('../models/User'); // Adjust path accordingly
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const router = express.Router();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'your-email@gmail.com',
//     pass: 'your-email-password',
//   },
// });

// // Forgot Password Route
// router.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;

//   try {
//     // 1. Find user by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // 2. Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration

//     // 3. Save reset token and expiration in database
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordTokenExpiration = resetTokenExpiration;
//     await user.save();

//     // 4. Send reset password email
//     const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
//     const mailOptions = {
//       from: 'your-email@gmail.com',
//       to: user.email,
//       subject: 'Password Reset Request',
//       text:` You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: 'Password reset link has been sent to your email.' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error sending reset email.' });
//   }
// });

// // Reset Password Route
// router.post('/reset-password/:token', async (req, res) => {
//     const { token } = req.params;
//     const { newPassword } = req.body;
  
//     try {
//       // 1. Find user by reset token
//       const user = await User.findOne({
//         resetPasswordToken: token,
//         resetPasswordTokenExpiration: { $gt: Date.now() }, // Check if token is expired
//       });
  
//       if (!user) {
//         return res.status(400).json({ message: 'Invalid or expired token' });
//       }
  
//       // 2. Hash new password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(newPassword, salt);
  
//       // 3. Update password and clear reset token
//       user.password = hashedPassword;
//       user.resetPasswordToken = undefined;
//       user.resetPasswordTokenExpiration = undefined;
  
//       await user.save();

//       res.status(200).json({ message: 'Password successfully reset. You can now log in.' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error resetting password.' });
//   }
// });

  
  

// module.exports = router;



// Import necessary dependencies
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../model/User');  // Assuming your User model is here
const crypto = require('crypto'); // Used to generate a unique reset token
const dotenv = require('dotenv');


const router = express.Router();

// Nodemailer Transporter (use your email service credentials)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,         // smtp-relay.brevo.com
  port: process.env.EMAIL_PORT,         // 587
  secure: false,                         // TLS, not SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP connection successful!');
  }
});


// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Create a reset token
    const resetToken = crypto.randomBytes(32).toString('hex'); // Generating a token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // Hash the token

    // Set token and expiration date in the user's profile
    user.resetToken = hashedToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send Reset Email with token (URL containing token)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error("Failed to send reset email:", error.message);
    res.status(500).json({ message: 'Error sending password reset email.' });
  }
});


router.post('/reset-password/:resetToken', async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log('Hashed Token:', hashedToken); 

    // Find the user with the valid token and expiration
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiration: { $gt: Date.now() }  // Ensure the token isn't expired
    });

    console.log('Searching for user with token:', hashedToken);

    if (!user) {
      console.log('Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Log token expiration for debugging
    console.log('Token Expiration:', user.resetTokenExpiration);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    user.resetToken = undefined;  // Clear the reset token after successful password change
    user.resetTokenExpiration = undefined;  // Clear the token expiration
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }

  console.log('Request body:', req.body);
  console.log('Token from URL:', resetToken);
});

module.exports = router;