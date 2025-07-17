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
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken"); // Needed for socket auth





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
     return callback(null, true);
    } else {
     return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE']
}));


const server = http.createServer(app); // use http server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});
app.set("socketio", io);

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

//support chat route
const chatLogRoutes = require('./routes/chatLog');
app.use('/api', chatLogRoutes);





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
app.use('/api/admin', adminDeposit);;




app.get("/", (req, res) => {
  res.send("app is running...");
});

//chat ai


const chatGemini = require("./routes/chatRoute");
app.use("/api", chatGemini);

const ticketRoutes = require("./routes/supportTickets");
app.use("/api/tickets", ticketRoutes);

require("./cronJobs/dailyTasks"); // or wherever you save it


const notificationRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationRoutes);


// ✅ SOCKET.IO AUTH + CHAT HANDLING
let connectedUsers = {}; // userId: socketId
let adminSocketId = null;

io.on("connection", (socket) => {
  console.log("🔌 A user connected", socket.id);

  // Authenticate socket using JWT
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      connectedUsers[userId] = socket.id;
      console.log(`✅ Authenticated User: ${userId}`);
    } catch (err) {
      console.log("❌ Invalid Token:", err.message);
    }
  });

  // When user sends message to admin
  socket.on("userMessage", ({ userId, message }) => {
    if (adminSocketId) {
      io.to(adminSocketId).emit("incomingUserMessage", { userId, message });
    }
  });

  // When admin replies to user
  socket.on("adminReply", ({ userId, reply }) => {
    const userSocketId = connectedUsers[userId];
    if (userSocketId) {
      io.to(userSocketId).emit("adminReply", { reply });
    }
  });

   socket.on("join", (userId) => {
    socket.join(userId); // ✅ This makes io.to(userId) work
    console.log(`✅ User ${userId} joined room ${userId}`);
  });

  // Register the admin
  socket.on("registerAdmin", () => {
    adminSocketId = socket.id;
    console.log("👑 Admin registered:", adminSocketId);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    if (socket.id === adminSocketId) adminSocketId = null;

    for (const [id, sId] of Object.entries(connectedUsers)) {
      if (sId === socket.id) delete connectedUsers[id];
    }
  });
});


mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(" MongoDB Connected"))
.catch(err => console.error(" MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION 💥', err.message);
  server.close(() => process.exit(1));
});
