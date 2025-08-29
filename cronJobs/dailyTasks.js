
// const cron = require('node-cron');
// const mongoose = require('mongoose');
// const Stake = require('../model/Stake');
// const User  = require('../model/User');

// const TZ = 'Africa/Lagos';
// const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// /* ---------- helpers ---------- */
// function ymdInTZ(date = new Date(), tz = TZ) {
//   return new Intl.DateTimeFormat('en-CA', {
//     timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
//   }).format(date); // "YYYY-MM-DD"
// }
// function utcFromYmd(ymd) {
//   const [y, m, d] = ymd.split('-').map(Number);
//   return Date.UTC(y, m - 1, d);
// }
// function daysDiffYmd(aYmd, bYmd) {
//   return Math.floor((utcFromYmd(bYmd) - utcFromYmd(aYmd)) / ONE_DAY_MS);
// }
// function minYmd(a, b) { return utcFromYmd(a) <= utcFromYmd(b) ? a : b; }
// function maxYmd(a, b) { return utcFromYmd(a) >= utcFromYmd(b) ? a : b; }

// /* ---------- optional once-per-day DB lock (recommended if multiple instances) ---------- */
// const lockSchema = new mongoose.Schema({ key: { type: String, unique: true } }, { collection: 'roi_locks', timestamps: true });
// const RoiLock = mongoose.models.RoiLock || mongoose.model('RoiLock', lockSchema);
// async function acquireDailyLock(todayYmd) {
//   try {
//     await RoiLock.create({ key: `roi:${todayYmd}` });
//     return true; // lock acquired
//   } catch (e) {
//     if (e && e.code === 11000) return false; // someone else ran it
//     throw e;
//   }
// }

// /* ---------- main runner (exported for manual trigger/testing) ---------- */
// async function processDailyROI(source = 'manual', { useLock = true, dryRun = false } = {}) {
//   const todayYmd = ymdInTZ(new Date(), TZ);
//   console.log(`🟢 ROI run [${source}] for ${todayYmd} (TZ ${TZ})`);

//   if (useLock) {
//     const gotLock = await acquireDailyLock(todayYmd);
//     if (!gotLock) {
//       console.log("🔒 Another instance already processed today's ROI. Exiting.");
//       return;
//     }
//   }

//   // Active stakes
//   const stakes = await Stake.find({ isCompleted: false }); // no populate; we use atomic $inc on User

//   if (!stakes.length) {
//     console.log('ℹ️ No active stakes.');
//     return;
//   }

//   for (const stake of stakes) {
//     // Validate numbers
//     const amount   = Number(stake.amount);
//     const dailyROI = Number(stake.dailyROI);
//     if (!Number.isFinite(amount) || !Number.isFinite(dailyROI)) {
//       console.warn(`⚠️ Invalid numbers on stake ${stake._id}. Skipping.`);
//       continue;
//     }

//     // ----- owed-days calculation -----
//     const startYmd = ymdInTZ(stake.startDate || stake.createdAt || stake._id.getTimestamp(), TZ);
//     const lastYmd  = stake.lastClaimDate || startYmd;
//     const endYmd   = stake.endDate ? ymdInTZ(stake.endDate, TZ) : null;
//     const payUntil = endYmd ? minYmd(todayYmd, endYmd) : todayYmd;

//     let owedDays = daysDiffYmd(lastYmd, payUntil);
//     if (owedDays <= 0) {
//       // nothing to pay (already credited up to today, or starts today)
//       continue;
//     }

//     const perDay = Number(((amount * dailyROI) / 100).toFixed(2));
//     const payout = Number((perDay * owedDays).toFixed(2));

//     // Debug snapshot
//     console.log({
//       stakeId: stake._id.toString(),
//       userId: stake.user?.toString?.() || String(stake.user),
//       lastYmd, payUntil, owedDays, perDay, payout,
//       totalBefore: stake.totalEarnings || 0
//     });

//     if (dryRun) continue; // log-only mode

//     // ----- transactional update -----
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       if (!Array.isArray(stake.roiHistory)) stake.roiHistory = [];

//       // Update stake first (so we know stake.totalEarnings for completion credit)
//       stake.totalEarnings = Number(((stake.totalEarnings || 0) + payout).toFixed(2));
//       stake.earningsSoFar = Number(((stake.earningsSoFar || 0) + payout).toFixed(2));
//       stake.lastClaimDate = payUntil;
//       stake.roiHistory.push({ date: payUntil, amount: payout, days: owedDays });

//       // Determine completion (we paid up to end date)
//       let justCompleted = false;
//       if (endYmd && maxYmd(payUntil, endYmd) === endYmd && payUntil === endYmd && !stake.isCompleted) {
//         stake.isCompleted = true;
//         justCompleted = true;
//       }

//       await stake.save({ session });

//       // Atomic user update ($inc)
//       await User.updateOne(
//         { _id: stake.user },
//         {
//           $inc: {
//             totalEarnings: payout,
//             ...(justCompleted ? { withdrawableBalance: stake.totalEarnings } : {})
//           }
//         },
//         { session }
//       );

//       await session.commitTransaction();
//       session.endSession();

//       console.log(`✅ Paid stake=${stake._id} days=${owedDays} perDay=${perDay} payout=${payout}${justCompleted ? ' (COMPLETED)' : ''}`);
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error(`❌ Stake ${stake._id} failed:`, err);
//     }
//   }
// }

// /* ---------- schedule at Africa/Lagos midnight (singleton guard) ---------- */
// if (process.env.ENABLE_IN_APP_CRON === 'true' && !globalThis.__ROI_CRON_REGISTERED__) {
//   globalThis.__ROI_CRON_REGISTERED__ = true;

//   cron.schedule('0 0 * * *', () => {
//     console.log('🕛 Trigger: Africa/Lagos midnight ROI');
//     processDailyROI('cron').catch(console.error);
//   }, { timezone: TZ });

//   console.log('⏰ ROI cron registered at', new Date().toISOString(), `TZ=${TZ}`);
// }

// module.exports = { processDailyROI };

const cron = require('node-cron');
const mongoose = require('mongoose');
const Stake = require('../model/Stake');
const User  = require('../model/User');

const TZ = 'Africa/Lagos';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/* ---------- helpers ---------- */
function ymdInTZ(date = new Date(), tz = TZ) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date); // "YYYY-MM-DD"
}

// Normalize anything (Date/String/ObjectId timestamp) to "YYYY-MM-DD" in Lagos
function toYmd(value, tz = TZ) {
  if (!value) return null;

  // Already "YYYY-MM-DD"?
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (!isNaN(d)) return ymdInTZ(d, tz);
    return null;
  }

  // Date / ObjectId timestamp / date-like
  if (value instanceof Date || typeof value.getTime === 'function') {
    return ymdInTZ(new Date(value), tz);
  }

  return null;
}

// Hardened: accepts Date or String; throws on bad input
function utcFromYmd(ymd) {
  if (typeof ymd !== 'string') ymd = toYmd(ymd);
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    throw new TypeError(`Bad YMD: ${String(ymd)}`);
  }
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function daysDiffYmd(aYmd, bYmd) {
  return Math.floor((utcFromYmd(bYmd) - utcFromYmd(aYmd)) / ONE_DAY_MS);
}
function minYmd(a, b) { return utcFromYmd(a) <= utcFromYmd(b) ? a : b; }
function maxYmd(a, b) { return utcFromYmd(a) >= utcFromYmd(b) ? a : b; }

/* ---------- once-per-day DB lock ---------- */
const lockSchema = new mongoose.Schema(
  { key: { type: String, unique: true } },
  { collection: 'roi_locks', timestamps: true }
);
const RoiLock = mongoose.models.RoiLock || mongoose.model('RoiLock', lockSchema);

async function acquireDailyLock(todayYmd) {
  try {
    await RoiLock.create({ key: `roi:${todayYmd}` });
    return true; // lock acquired
  } catch (e) {
    if (e && e.code === 11000) return false; // already processed
    throw e;
  }
}

/* ---------- main runner (exported) ---------- */
async function processDailyROI(source = 'manual', { useLock = true, dryRun = false } = {}) {
  const todayYmd = ymdInTZ(new Date(), TZ);
  console.log(`🟢 ROI run [${source}] for ${todayYmd} (TZ ${TZ})`);

  if (useLock) {
    const gotLock = await acquireDailyLock(todayYmd);
    console.log(gotLock ? `🔓 Lock acquired for ${todayYmd}` : `🔒 Lock exists for ${todayYmd} — exiting`);
    if (!gotLock) return;
  }

  // Active stakes
  const stakes = await Stake.find({ isCompleted: false });
  if (!stakes.length) { console.log('ℹ️ No active stakes.'); return; }

  for (const stake of stakes) {
    // Defensive: missing user
    if (!stake.user) { console.warn(`⚠️ Stake ${stake._id} has no user ref`); continue; }

    // Validate numbers
    const amount   = Number(stake.amount);
    const dailyROI = Number(stake.dailyROI);
    if (!Number.isFinite(amount) || !Number.isFinite(dailyROI)) {
      console.warn(`⚠️ Invalid numbers on stake ${stake._id}. Skipping.`);
      continue;
    }

    // ---------- owed-days calculation (normalized to YMD strings) ----------
    const todayY = todayYmd;

    const startYmd = toYmd(stake.startDate)
                  || toYmd(stake.createdAt)
                  || toYmd(stake._id.getTimestamp())
                  || todayY; // final fallback

    const lastYmd  = toYmd(stake.lastClaimDate) || startYmd;
    const endYmd   = toYmd(stake.endDate); // may be null
    const payUntil = endYmd ? minYmd(todayY, endYmd) : todayY;

    let owedDays = daysDiffYmd(lastYmd, payUntil);
    if (owedDays <= 0) continue; // nothing to pay today

    // ---------- payout ----------
    const perDay = Number(((amount * dailyROI) / 100).toFixed(2));
    const payout = Number((perDay * owedDays).toFixed(2));

    // Debug snapshot
    console.log({
      stakeId: stake._id.toString(),
      userId: stake.user?.toString?.() || String(stake.user),
      lastYmd, payUntil, owedDays, perDay, payout,
      totalBefore: stake.totalEarnings || 0
    });

    if (dryRun) continue; // log-only mode

    // ----- transactional update -----
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (!Array.isArray(stake.roiHistory)) stake.roiHistory = [];

      // Update stake first (so we know stake.totalEarnings for completion credit)
      stake.totalEarnings = Number(((stake.totalEarnings || 0) + payout).toFixed(2));
      stake.earningsSoFar = Number(((stake.earningsSoFar || 0) + payout).toFixed(2));
      stake.lastClaimDate = payUntil;
      stake.roiHistory.push({ date: new Date(utcFromYmd(payUntil)), amount: payout, days: owedDays });

      // Determine completion (we paid up to end date)
      let justCompleted = false;
      if (endYmd && maxYmd(payUntil, endYmd) === endYmd && payUntil === endYmd && !stake.isCompleted) {
        stake.isCompleted = true;
        justCompleted = true;
      }

      await stake.save({ session });

      // Atomic user update ($inc)
      await User.updateOne(
        { _id: stake.user },
        {
          $inc: {
            totalEarnings: payout,
            ...(justCompleted ? { withdrawableBalance: stake.totalEarnings } : {})
          }
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      console.log(`✅ Paid stake=${stake._id} days=${owedDays} perDay=${perDay} payout=${payout}${justCompleted ? ' (COMPLETED)' : ''}`);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(`❌ Stake ${stake._id} failed:`, err);
    }
  }
}

/* ---------- schedule at Africa/Lagos midnight (env-gated singleton) ---------- */
if (process.env.ENABLE_IN_APP_CRON === 'true' && !globalThis.__ROI_CRON_REGISTERED__) {
  globalThis.__ROI_CRON_REGISTERED__ = true;
  cron.schedule('0 0 * * *', () => {
    console.log('🕛 Trigger: Africa/Lagos midnight ROI');
    processDailyROI('cron').catch(console.error);
  }, { timezone: TZ });
  console.log('⏰ In-app ROI cron registered', new Date().toISOString(), `TZ=${TZ}`);
}

module.exports = { processDailyROI };
