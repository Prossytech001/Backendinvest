const router = require('express').Router();
const { processDailyROI } = require('../cronJobs/dailyTasks');

router.post('/roi/run', async (req, res) => {
  const key = req.header('x-api-key');
  if (key !== process.env.ROI_ADMIN_KEY) return res.status(401).send('Unauthorized');
  try {
    await processDailyROI('http');   // uses your DB lock & catch-up
    res.send('OK');
  } catch (e) {
    console.error(e);
    res.status(500).send('Job failed');
  }
});

module.exports = router;
