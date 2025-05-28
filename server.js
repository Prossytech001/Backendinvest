// require("dotenv").config({ path: "./secure.env" }); // ✅ Load secure.env

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(express.json());
// app.use(cors());

// // ✅ Check if MONGODB_URL is loaded correctly
// if (!process.env.MONGODB_URL) {
//   console.error("❌ MONGODB_URL is not defined in secure.env file");
//   process.exit(1); // Stop the server if DB URL is missing
// }

// app.get("/", (req,res) => {
//     res.send("how")
// })





// // ✅ Connect to MongoDB Atlas
// mongoose.connect(process.env.MONGODB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("✅ MongoDB Connected"))
// .catch(err => console.error("❌ MongoDB Connection Error:", err));

// // ✅ Import and use routes
// const userRoutes = require("./routes/userRoutes");  // Make sure this path is correct
// app.use("/api/users", userRoutes); // All routes will start with "/api/users"

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("./cronJobs/dailyTasks");
const axios = require("axios");


const { OpenAI } = require("openai");


 // Import the cron jobs




const app = express();
app.use(express.json());
// app.use(cors());
const allowedOrigins = [
  'https://cryptous-nu.vercel.app', // ✅ Your deployed frontend
  'http://localhost:5173'           // ✅ For local development
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman or mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


//  Import and use user routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const planRoutes = require("./routes/planRoutes");
app.use("/api/plans", planRoutes);


const stakeRoutes = require("./routes/stakeRoutes");
app.use("/api/stakes", stakeRoutes);

const withdrawRoute = require( "./routes/withdraw");
app.use("/api/withdraw", withdrawRoute);

const roiRoutes = require("./routes/roi");
app.use("/api/user", roiRoutes);


const contactRoute = require('./routes/contact');
app.use('/api', contactRoute);

//payment-Routes
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const forgetRoutes = require('./routes/forgetPasswordRoutes')
app.use('/api/auth', forgetRoutes)

//history-Routes
const historyRoutes = require('./routes/history')
app.use('/api',historyRoutes )


//Admin Routes


const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);


//admin overview routes
const adminOverviewRoutes = require('./routes/adminOverview');
app.use('/api/admin/overview', adminOverviewRoutes);


app.use('/api/admin/users', require('./routes/adminUsers'));

const userActivityRoutes = require('./routes/activity');
app.use('/api/activity', userActivityRoutes);

// Admin Withdrawals Routes
const adminWithdrawalsRoutes = require('./routes/adminWithdrawals');
app.use('/api/admin/withdrawals', adminWithdrawalsRoutes);

//Admin deposite
const adminDeposit = require('./routes/adminDeposit');
app.use('/api/admin', adminDeposit);




app.get("/", (req, res) => {
  res.send("app is running...");
});

//chat ai


const chatGemini = require("./routes/chatRoute");
app.use("/api", chatGemini);



mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(" MongoDB Connected"))
.catch(err => console.error(" MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
