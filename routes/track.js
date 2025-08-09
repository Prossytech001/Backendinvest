// routes/track.js
// const express = require('express');
// const router = express.Router();
// const Visitor = require('../model/Visitor'); // MongoDB model
// const UAParser = require('ua-parser-js');


// router.get('/track-visitors/exists', async (req, res) => {
//   try {
//     const userAgent = req.headers['user-agent'] || '';
//     // NOTE: trust proxy if behind a proxy/load balancer
//     // app.set('trust proxy', 1)
//     const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     const existing = await Visitor.findOne({ ip, userAgent });
//     return res.json({ exists: !!existing });
//   } catch (err) {
//     console.error('exists check error', err);
//     res.sendStatus(500);
//   }
// });



// router.post('/track-visit', async (req, res) => {
//   try {
//     const { email } = req.body; // optional for now
//     const userAgent = req.headers['user-agent'] || '';
//     const parser = new UAParser(userAgent);
//     const ua = parser.getResult();

//     const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     const existing = await Visitor.findOne({ ip, userAgent });
//     if (existing) {
//       return res.status(200).json({ message: 'Already tracked' });
//     }

//     await Visitor.create({
//       ip:'',
//       country:'',
//       region:'',
//       city:'',
//       isp:'',
//       userAgent:'',
//       browser: ua.browser.name || '',
//       browserVersion: ua.browser.version || '',
//       os: ua.os.name || '',
//       osVersion: ua.os.version || '',
//       deviceType: ua.device.type || 'desktop',
//       timestamp: new Date(),
//     });


//     res.status(201).json({ message: 'Visitor created' });
//   } catch (err) {
//     console.error('track-visit error', err);
//     res.sendStatus(500);
//   }
// });

// // Get visitors stats
// router.get('/track-visitors/stats', async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const visitorsToday = await Visitor.countDocuments({
//       timestamp: { $gte: today }
//     });

//     const totalVisitors = await Visitor.countDocuments();

//     res.json({ totalVisitors, visitorsToday });
//   } catch (error) {
//     console.error("❌ Error fetching visitor stats:", error);
//     res.sendStatus(500);
//   }
// });


// // Get all visitor logs (for admin UI)
// router.get('/track-visitors', async (req, res) => {
//   try {
//     const visitors = await Visitor.find().sort({ timestamp: -1 }); // newest first
//     res.status(200).json(visitors);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });


// module.exports = router;
const express = require('express');
const router = express.Router();
const axios = require('axios');
const UAParser = require('ua-parser-js');
const Visitor = require('../model/Visitor'); // your Mongoose model

// --- helpers ---
function getClientIp(req) {
  // prefer x-forwarded-for when behind proxy
  const xf = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || req.ip || req.connection?.remoteAddress || '';
}

async function lookupGeo(ip) {
  // In local dev IP is usually 127.0.0.1 / ::1 (no real geo)
  if (!ip || ip === '127.0.0.1' || ip === '::1') return {};
  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 2500 });
    return {
      country: data.country_name || '',
      region: data.region || '',
      city: data.city || '',
      isp: data.org || '',
    };
  } catch {
    return {};
  }
}

// --- check existence to decide popup ---
router.get('/track-visitors/exists', async (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = getClientIp(req);

    const existing = await Visitor.findOne({ ip, userAgent });
    return res.json({ exists: !!existing });
  } catch (err) {
    console.error('exists check error', err);
    res.sendStatus(500);
  }
});

// --- create visitor if not exists (optional email) ---
// router.post('/track-visit', async (req, res) => {
//   try {
//     const { email } = req.body; // optional
//     const userAgent = req.headers['user-agent'] || '';
//     const ip = getClientIp(req);

//     const parser = new UAParser(userAgent);
//     const ua = parser.getResult();

//     // skip duplicate by (ip + userAgent)
//     const existing = await Visitor.findOne({ ip, userAgent });
//     if (existing) {
//       return res.status(200).json({ message: 'Already tracked' });
//     }

//     // server-side geo enrichment (optional)
//     const geo = await lookupGeo(ip);

//     await Visitor.create({
//       email: email || null,
//       ip,
//       userAgent,
//       country: geo.country || '',
//       region: geo.region || '',
//       city: geo.city || '',
//       isp: geo.isp || '',
//       browser: ua.browser.name || '',
//       browserVersion: ua.browser.version || '',
//       os: ua.os.name || '',
//       osVersion: ua.os.version || '',
//       deviceType: ua.device.type || 'desktop',
//       timestamp: new Date(),
//     });

//     res.status(201).json({ message: 'Visitor created' });
//   } catch (err) {
//     console.error('track-visit error', err);
//     res.sendStatus(500);
//   }
// });
router.post('/track-visit', async (req, res) => {
  try {
    const { email, ip: ipFromClient, country, region, city, isp } = req.body;
    const userAgent = req.headers['user-agent'] || '';

    // Use provided IP if available, fallback to server-detected
    const ip = ipFromClient || getClientIp(req);

    const parser = new UAParser(userAgent);
    const ua = parser.getResult();

    // prevent duplicates by ip + userAgent
    const existing = await Visitor.findOne({ ip, userAgent });
    if (existing) return res.status(200).json({ message: 'Already tracked' });

    await Visitor.create({
      email: email || null,
      ip,
      userAgent,
      country: country || '',
      region: region || '',
      city: city || '',
      isp: isp || '',
      browser: ua.browser.name || '',
      browserVersion: ua.browser.version || '',
      os: ua.os.name || '',
      osVersion: ua.os.version || '',
      deviceType: ua.device.type || 'desktop',
      timestamp: new Date(),
    });

    res.status(201).json({ message: 'Visitor created' });
  } catch (err) {
    console.error('track-visit error', err);
    res.sendStatus(500);
  }
});

// --- stats for dashboard ---
router.get('/track-visitors/stats', async (_req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalVisitors, visitorsToday] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ timestamp: { $gte: startOfDay } }),
    ]);

    res.json({ totalVisitors, visitorsToday });
  } catch (error) {
    console.error('❌ Error fetching visitor stats:', error);
    res.sendStatus(500);
  }
});

// --- list for admin UI ---
router.get('/track-visitors', async (_req, res) => {
  try {
    const visitors = await Visitor.find().sort({ timestamp: -1 });
    res.status(200).json(visitors);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
