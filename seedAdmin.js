
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
