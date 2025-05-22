// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const Admin = require('../model/Admin');

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Admin = require('../model/Admin'); // ✅ Make sure this is correct

// // POST /api/admin/login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ message: 'All fields are required' });

//     const admin = await Admin.findOne({ email });
//     if (!admin)
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch)
//       return res.status(401).json({ message: 'Invalid credentials' });

//     // const token = jwt.sign(
//     //   { adminId: admin._id },
//     //   process.env.JWT_SECRET,
//     //   { expiresIn: '1d' }
//     // )
//     // ;

//     const token = jwt.sign(
//         { id: admin._id, isAdmin: true },
//         process.env.JWT_SECRET,
//         { expiresIn: '20d' }
//       );
      

//     res.status(200).json({ token, admin: { email: admin.email, username: admin.username } });

//   } catch (error) {
//     console.error('Login error:', error); // 🔍 Log to see the real error
//     res.status(500).json({ message: 'Server error' });
//   }

//   res.status(200).json({
//   success: true,
//   token,
//   admin: {
//     id: admin._id,
//     email: admin.email,
//     username: admin.username,
//   }
// });

// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin'); // ✅ Correct model

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '20d' }
    );

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
