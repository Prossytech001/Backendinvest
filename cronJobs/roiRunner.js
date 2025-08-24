// jobs/roiRunner.js
const mongoose = require('mongoose');
const { processDailyROI } = require('../cronJobs/dailyTasks');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await processDailyROI('cli');        // add { dryRun: true } to log without saving
  await mongoose.connection.close();
  process.exit(0);
})();
