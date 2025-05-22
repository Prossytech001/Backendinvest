// const jwt = require('jsonwebtoken');
// const User = require('../model/User');

// const adminMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Authorization token missing or invalid' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user || user.role !== 'admin') {
//       return res.status(403).json({ message: 'Access denied. Admins only.' });
//     }

//     req.user = user; // Attach user object to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = adminMiddleware;

// middlewares/adminMiddleware.js
// const jwt = require("jsonwebtoken");
// const User = require("../model/User");

// const adminMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ message: "Access denied" });
//     }
//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = adminMiddleware;
// const jwt = require('jsonwebtoken');
// const Admin = require('../model/Admin');

// const adminProtect = async (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const admin = await Admin.findById(decoded.adminId);
//     if (!admin) return res.status(403).json({ message: 'Access denied' });

//     req.admin = admin;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };

// module.exports = adminProtect;


const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin');
 // ✅ Parses incoming JSON requests

const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   const admin = await Admin.findById(decoded.id);

  //   if (!admin || !admin.isAdmin) {
  //     return res.status(403).json({ message: 'Forbidden: Admin only' });
  //   }

  //   req.admin = admin;
  //   next();
  // } catch (err) {
  //   return res.status(403).json({ message: 'Invalid or expired token' });
  // }
  try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('[Middleware] Decoded token:', decoded);

  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    console.warn('[Middleware] Admin not found');
    return res.status(403).json({ message: 'Forbidden: Admin not found' });
  }

  if (!admin.isAdmin) {
    console.warn('[Middleware] isAdmin is false');
    return res.status(403).json({ message: 'Forbidden: Not an admin' });
  }

  req.admin = admin;
  next();
} catch (err) {
  console.error('[Middleware] JWT Error:', err.message);
  return res.status(403).json({ message: 'Invalid or expired token' });
}

};

module.exports = adminAuth;
