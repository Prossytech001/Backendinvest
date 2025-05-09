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
require("./cronJobs/dailyTasks"); // Import the cron jobs




const app = express();
app.use(express.json());
app.use(cors());

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




// app.get("/", (req, res) => {
//   res.send("API is running...");
// });
app.get("/test", (req, res) => {
  res.send("Test route working!");
});


mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(" MongoDB Connected"))
.catch(err => console.error(" MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
