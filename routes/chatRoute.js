// const express = require("express");
// const fs = require("fs");
// const router = express.Router();
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Load text file content
// const textData = fs.readFileSync("data/data.txt", "utf-8");

// router.post("/chat", async (req, res) => {
//   const userMessage = req.body.message;

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     const prompt = `
// Use the following website information to answer the question as accurately as possible.
// If the answer is not found, say "Sorry, I couldn't find that in the website info."

// Website Info:
// ${textData}

// User: ${userMessage}
// `;

//     const result = await model.generateContent(prompt);
//     const reply = result.response.text();
//     res.json({ reply });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
// backend/routes/chat.js or in your main server file
// const express = require("express");
// const fs = require("fs");
// const router = express.Router();
// const axios = require("axios");

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Make sure this is in .env

// router.post("/chat", async (req, res) => {
//   try {
//     const userMessage = req.body.message;
//     const contextText = fs.readFileSync("data/data.txt", "utf8"); // Must exist!

//     const payload = {
//       contents: [
//         {
//         "role": "user",
//           parts: [
//             { text: `You are a helpful assistant called cryptous AI. only answer based on the following context:\n${contextText}\n\nQuestion: ${userMessage}` }
//           ]
//         }
//       ]
//     };

//     const geminiRes = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
//       payload
//     );

//     const reply = geminiRes.data.candidates[0]?.content?.parts[0]?.text || "No response.";
//     res.json({ reply });

//   } catch (err) {
//     console.error("AI Error:", err.response?.data || err.message);
//     res.status(500).json({ error: "AI Error", details: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const contextText = fs.readFileSync(path.join(__dirname, "../data/data.txt"), "utf8");

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a helpful assistant. Only answer using the following context:\n${contextText}\n\nQuestion: ${userMessage}`,
            },
          ],
        },
      ],
    };

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      payload
    );

    const reply = geminiRes.data.candidates[0]?.content?.parts[0]?.text || "No response.";
    res.json({ reply });

  } catch (err) {
    console.error("🔥 AI Error:", err.message);
    console.error("📦 AI Error Response:", err.response?.data || "No additional details");
    res.status(500).json({ error: "AI Error", details: err.response?.data || err.message });
  }
});


module.exports = router;
