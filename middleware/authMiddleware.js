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


//middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../model/User");

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

// const jwt = require("jsonwebtoken");
// const User = require("../model/User");

// const protect = async (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);  // `id` should match the payload field
//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }
//     req.user = user;  // Attach the user object to the request for further use
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = {protect};
