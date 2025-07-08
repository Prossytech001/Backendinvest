// controllers/authController.js
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../model/User'); // Your User model
// const jwt = require('jsonwebtoken');

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// exports.googleLogin = async (req, res) => {
//   const { credential } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();

//     const { sub, email, given_name, family_name } = payload;

//     // Find or create user
//     let user = await User.findOne({ googleId: sub });

//     if (!user) {
//       user = await User.create({
//         googleId: sub,
//         email,
//         username: email.split("@")[0],
//         firstName: given_name,
//         lastName: family_name,
//         isVerified: true,
//         password: "GOOGLE_OAUTH", // dummy placeholder
//       });
//     }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({ user, token });
//   } catch (error) {
//     console.error("Google login error", error);
//     res.status(401).json({ message: "Google authentication failed" });
//   }
// };
// const { OAuth2Client } = require("google-auth-library");
// const jwt = require("jsonwebtoken");
// const User = require("../model/User");

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// exports.googleLogin = async (req, res) => {
//   const { token } = req.body;

//   try {
//     // Verify token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { sub: googleId, email, given_name, family_name } = payload;

//     // Check for existing user
//     let user = await User.findOne({ email });

//     if (!user) {
//       // Create new user if not found
//       user = await User.create({
//         googleId,
//         email,
//         username: email.split("@")[0] + Math.floor(Math.random() * 1000),
//         firstName: given_name,
//         lastName: family_name,
//         isVerified: true,
//       });
//     }

//     // Sign JWT
//     const authToken = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({ user, token: authToken });
//   } catch (error) {
//     console.error("Google login error", error);
//     res.status(401).json({ message: "Google authentication failed" });
//   }
// };
// exports.googleLogin = async (req, res) => {
//   const { credential } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { sub: googleId, email, given_name, family_name } = payload;

//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         googleId,
//         email,
//         username: email.split("@")[0] + Math.floor(Math.random() * 1000),
//         firstName: given_name,
//         lastName: family_name,
//         isVerified: true,
//       });
//     }

//     const authToken = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({ user, token: authToken });
//   } catch (error) {
//     console.error("Google login error", error);
//     res.status(401).json({ message: "Google authentication failed" });
//   }
// };
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // <- define it at top-level

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Missing Google credential" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        username: email.split("@")[0] + Math.floor(Math.random() * 1000),
        firstName: given_name,
        lastName: family_name,
        isVerified: true,
      });
    }

    const authToken = jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


    res.status(200).json({ user, token: authToken });
  } catch (error) {
    console.error("Google login error", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
