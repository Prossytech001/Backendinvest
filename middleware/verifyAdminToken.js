// middleware/verifyAdminToken.js

// const jwt = require('jsonwebtoken');
// const Admin = require('../model/Admin'); // Your Admin model
// // ✅ Parses incoming JSON requests
// module.exports = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Optional: confirm admin exists in the DB
//     const admin = await Admin.findById(decoded.id);
//     if (!admin) {
//       return res.status(403).json({ message: 'Forbidden: Admin not found' });
//     }

//     req.admin = decoded.adminId; // Add admin to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
//   }
// };


// const jwt = require('jsonwebtoken');
// const Admin = require('../model/Admin');

// module.exports = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     // const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // const admin = await Admin.findById(decoded.adminId);
//     // if (!admin) {
//     //   return res.status(403).json({ message: 'Forbidden: Admin not found' });
//     // }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('[Middleware] Decoded token:', decoded);


// const admin = await Admin.findById(decoded.id); // ✅ Now decoded.id exists
// if (!admin || !admin.isAdmin) {
//   return res.status(403).json({ message: 'Forbidden: Admin only' });
// }

//     req.admin = admin; // Optional: attach full admin object
//     console.log("Decoded token:", decoded);
// console.log("Admin found:", admin);
//     next();
//   } catch (err) {
//     console.error('Token verification error:', err);
//     return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
//   }
// };

const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id); // match 'id' not 'adminId'

    if (!admin || admin.isAdmin !== true) {
      return res.status(403).json({ message: 'Forbidden: Admin only' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Admin Auth Error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
