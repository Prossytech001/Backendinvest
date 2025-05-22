// require('dotenv').config(); // Make sure this is at the top

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const User = require('./model/User'); // Adjust path if needed

// async function seedAdmin() {
//   const uri = process.env.MONGODB_URL;
//   if (!uri) {
//     console.error('MONGO_URI is not defined in .env');
//     return process.exit(1);
//   }

//   await mongoose.connect(uri);

//   const existingAdmin = await User.findOne({ email: 'admin@example.com' });

//   if (existingAdmin) {
//     console.log('Admin already exists');
//     return process.exit();
//   }

//   const hashedPassword = await bcrypt.hash('AdminPassword123', 10);

//   const admin = new User({
//     username: 'admins',
//     email: 'admin@examples.com',
//     password: hashedPassword,
//     role: 'admin',
//     isVerified: true,
//     isAdmin: true,
//   });
//   await User.deleteMany(); // optional: clean old data
//     await User.insertMany(admin); // optional: insert new data
//   await admin.save();
//   console.log('Admin seeded successfully');
//   process.exit();
// }

// seedAdmin().catch(err => {
//   console.error('Error seeding admin:', err);
//   process.exit(1);
// });
// require('dotenv').config();

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const User = require('./model/User');

// async function seedAdmin() {
//   const uri = process.env.MONGODB_URL;
//   if (!uri) {
//     console.error('MONGODB_URL is not defined in .env');
//     return process.exit(1);
//   }

//   await mongoose.connect(uri);

//   const email = 'Priyon@gmail.com';
//   const existingAdmin = await User.findOne({ email });

//   if (existingAdmin) {
//     // ✅ Update if not already an admin
//     if (!existingAdmin.isAdmin) {
//       existingAdmin.isAdmin = true;
//       await existingAdmin.save();
//       console.log('Admin updated with isAdmin: true');
//     } else {
//       console.log('Admin already exists with isAdmin: true');
//     }
//     return process.exit();
//   }

//   const hashedPassword = await bcrypt.hash('AdminPassword123', 10);

//   const admin = new User({
//     username: 'admin',
//     email,
//     password: hashedPassword,
//     role: 'admin',
//     isVerified: true,
//     isAdmin: true // ✅ Set during creation
//   });

//   await admin.save();
//   console.log('Admin seeded successfully');
//   process.exit();
// }

// seedAdmin().catch(err => {
//   console.error('Error seeding admin:', err);
//   process.exit(1);
// });
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./model/Admin'); // ✅ Use Admin model, not User

async function seedAdmin() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error('MONGODB_URL is not defined in .env');
    return process.exit(1);
  }

  await mongoose.connect(uri);

  const email = 'adminpro@example.com';
  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    console.log('Admin already exists');
    return process.exit();
  }

  const hashedPassword = await bcrypt.hash('AdminPassword123', 10);

  const admin = new Admin({
    username: 'superadmin',
    email,
    password: hashedPassword
  });

  await admin.save();
  console.log('Admin seeded successfully');
  process.exit();
}

seedAdmin().catch(err => {
  console.error('Error seeding admin:', err);
  process.exit(1);
});
