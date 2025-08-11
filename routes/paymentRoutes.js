const express = require("express");
const router = express.Router();
const User = require('../model/User');
const Payment = require("../model/Payment");
const { createPayment } = require("../utils/nowPayments");

const crypto = require('crypto');
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const np = await createPayment(amount, userId /*, { sandboxCase: 'success' } */);

    const payment = await Payment.create({
      user: userId,
      amount,                          // amount you’ll credit on 'finished'
      currency: (process.env.NOWPAY_PAY_CURRENCY || 'usdttrc20').includes('usdt') ? 'usdt' : 'crypto',
      status: "waiting",
      paymentId: np.payment_id,
      payAddress: np.pay_address || null,
      invoiceUrl: np.invoice_url || null,
      transactionDetails: {
        provider: "NOWPayments",
        orderId: np.order_id,
        price_amount: amount,
        price_currency: process.env.NOWPAY_BASE_CURRENCY || "usd",
        pay_currency: process.env.NOWPAY_PAY_CURRENCY || "usdttrc20",
        raw: np,
      },
    });

    return res.status(201).json({
      success: true,
      paymentId: payment.paymentId,
      payAddress: payment.payAddress,
      amount: payment.amount,
      currency: payment.currency,
      invoiceUrl: payment.invoiceUrl,
      orderId: np.order_id,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || "Create failed" });
  }
});




// router.post('/ipn', async (req, res) => {
//   const signature = req.headers['x-nowpayments-sig'];
//   const secret = process.env.NOWPAYMENTS_IPN_SECRET;

//   const hmac = crypto.createHmac('sha512', secret);
//   hmac.update(JSON.stringify(req.body));
//   const expectedSignature = hmac.digest('hex');

//   if (signature !== expectedSignature) {
//     console.warn('Invalid IPN signature');
//     return res.status(401).json({ message: 'Unauthorized IPN call' });
//   }

//   try {
//     const { payment_id, payment_status } = req.body;

//     if (!payment_id || !payment_status) {
//       return res.status(400).json({ message: 'Invalid IPN payload' });
//     }

//     const payment = await Payment.findOne({ paymentId: payment_id });
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }

//     // Save full IPN data for audit/debugging
//     payment.transactionDetails = req.body;

//     // Avoid reprocessing completed payments
    
      
    

//     // Handle all statuses
//     if (payment_status === 'confirming') {
//       payment.status = 'confirming';
//     } else if (payment_status === 'expired') {
//       payment.status = 'expired';
//     } else if (payment_status === 'sending') {
//       payment.status = 'sending';
//     } else if (payment_status === 'failed') {
//       payment.status = 'failed';
//     } else if (payment_status === 'finished') {
//       payment.status = 'finished';

//       // Credit user's balance
//       const user = await User.findById(payment.user);
//       if (user) {
//         user.balance += payment.amount;
//         await user.save();
//       }
//       return res.status(200).json({ message: 'Payment processed and balance updated' });
//     } else {
//       return res.status(200).json({ message: 'IPN received, no matching action' });
//     }

//     await payment.save();
//     return res.status(200).json({ message: `Payment marked as ${payment.status}` });
//   } catch (error) {
//     console.error('IPN Error:', error);
//     res.status(500).json({ message: 'Server error processing IPN' });
//   }
// });
router.post('/ipn', async (req, res) => {
  try {
    const signature = req.header('x-nowpayments-sig') || '';
    const secret = process.env.NOWPAYMENTS_IPN_SECRET || '';

    // Use RAW body set by bodyParser verify
    const raw = req.rawBody || JSON.stringify(req.body || {});
    // If signatures fail with raw, switch to the sorted-body approach shown above.
    const expectedSig = crypto.createHmac('sha512', secret).update(raw).digest('hex');
    if (signature !== expectedSig) {
      console.warn('Invalid IPN signature');
      return res.status(401).json({ message: 'Unauthorized IPN call' });
    }

    const {
      payment_id,
      payment_status,
      pay_amount,
      actually_paid,
      pay_currency,
    } = req.body;

    if (!payment_id || !payment_status) {
      return res.status(400).json({ message: 'Invalid IPN payload' });
    }

    const payment = await Payment.findOne({ paymentId: payment_id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Save payload for audit
    payment.transactionDetails = req.body;

    // If already terminal, just ack (idempotent)
    if (['finished','failed','refunded','expired'].includes(payment.status)) {
      await payment.save();
      return res.json({ ok: true, message: 'Already finalized' });
    }

    // Update data
    payment.status = payment_status;
    if (pay_currency) payment.payCurrency = pay_currency;
    if (pay_amount != null) payment.payAmount = Number(pay_amount);
    if (actually_paid != null) payment.actuallyPaid = Number(actually_paid);

    // Credit once on finished
    if (payment_status === 'finished' && !payment.creditedAt) {
      const user = await User.findById(payment.user);
      if (user) {
        user.balance = (user.balance || 0) + Number(payment.amount); // credit amount you locked at /create
        await user.save();
      }
      payment.creditedAt = new Date();
    }

    await payment.save();
    return res.json({ ok: true, status: payment.status });
  } catch (err) {
    console.error('IPN Error:', err);
    return res.status(500).json({ message: 'Server error processing IPN' });
  }
});



module.exports = router;

