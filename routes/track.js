// routes/track.js
const express = require('express');
const router = express.Router();
const Visitor = require('../model/Visitor'); // MongoDB model
const UAParser = require('ua-parser-js');


// router.post('/track-visit', async (req, res) => {
//   try {
//     console.log("📥 Visitor received:", req.body);

//     const { ip, country, region, city, isp } = req.body;

//     await Visitor.create({
//       ip,
//       country,
//       region,
//       city,
//       isp,
//       userAgent: req.headers['user-agent'],
//       timestamp: new Date(),
//     });

//     res.sendStatus(200);
//   } catch (error) {
//     console.error("❌ Error saving visitor:", error);
//     res.sendStatus(500);
//   }
// });
router.post('/track-visit', async (req, res) => {
  try {
    const { ip, country, region, city, isp } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const ua = parser.getResult();

    console.log("📥 Visitor received:", req.body);
    console.log("🧠 Parsed UA:", ua);

    await Visitor.create({
      ip,
      country,
      region,
      city,
      isp,
      userAgent,
      browser: ua.browser.name || '',
      browserVersion: ua.browser.version || '',
      os: ua.os.name || '',
      osVersion: ua.os.version || '',
      deviceType: ua.device.type || 'desktop',
      timestamp: new Date(),
    });

    console.log("✅ Visitor saved to DB");
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error saving visitor:", error);
    res.sendStatus(500);
  }
});


// Get all visitor logs (for admin UI)
router.get('/track-visitors', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ timestamp: -1 }); // newest first
    res.status(200).json(visitors);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});


module.exports = router;
