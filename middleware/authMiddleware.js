// const jwt = require("jsonwebtoken");
// const User = require("../model/User");

// const protect = async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized" });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// module.exports = { protect };


// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../model/User");

// const protect = async (req, res, next) => {
//   console.log("Protect middleware triggered"); // Add this to check if the middleware is running

//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) {
//     console.log("No token provided"); // Log if there's no token
//     return res.status(401).json({ message: "No token, authorization denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded userId:", decoded.userId); // Log the decoded userId
//     req.user = await User.findById(decoded.userId); // Get user from the token
//     if (!req.user) {
//       console.log("User not found"); // Log if no user found
//       return res.status(401).json({ message: "User not found" });
//     }
//     console.log("User found:", req.user.username); // Log the user's name to check

//     next(); // Proceed to the next route handler
//   } catch (error) {
//     console.log("Error in protect middleware:", error.message); // Log the error message
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = { protect };
const protect = async (req, res, next) => {
  console.log("Protect middleware triggered");

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    // Try getting the user fresh from DB
    const user = await User.findById(decoded.userId).select("-password"); // Don't select password
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protect middleware:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = { protect };