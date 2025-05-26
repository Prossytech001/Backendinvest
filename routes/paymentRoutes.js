const express = require("express");
const router = express.Router();
const User = require('../model/User');
const Payment = require("../model/Payment");
const { createPayment } = require("../utils/nowPayments");
require('dotenv').config();
const crypto = require('crypto');

router.post("/create", async (req, res) => {
  try {
    const { amount } = req.body;
const userId = req.user.id;


    if (!amount || !userId || amount <= 0) {
  return res.status(400).json({ success: false, message: 'Invalid payment request' });
}


    const paymentData = await createPayment(amount, userId);

    const newPayment = new Payment({
      user: userId,
      amount,
      paymentId: paymentData.payment_id,
      payAddress: paymentData.pay_address,
      currency: "usdt",
      status: "waiting",
    });

    await newPayment.save();

    res.status(200).json({
      success: true,
      paymentId: newPayment.paymentId,
      payAddress: newPayment.payAddress,
      amount: newPayment.amount,
      invoiceUrl: paymentData.invoice_url

    });
  } catch (err) {
    console.error("Payment error:", err.message);
    res.status(500).json({ success: false, error: "Failed to create payment." });
  }
});




// IPN callback route (must match the URL set in NOWPayments IPN settings)
// router.post('/ipn', async (req, res) => {
// // Validate the IPN payload
// const signature = req.headers['x-nowpayments-sig'];
//   const secret = process.env.NOWPAYMENTS_IPN_SECRET;

//   const hmac = crypto.createHmac('sha512', secret);
//   hmac.update(JSON.stringify(req.body));
//   const expectedSignature = hmac.digest('hex');

//   if (signature !== expectedSignature) {
//     console.warn('Invalid IPN signature');
//     return res.status(401).json({ message: 'Unauthorized IPN call' });
//   }


// await payment.save();
//     try {
//       const { payment_id, payment_status } = req.body;
  
//       if (!payment_id || !payment_status) {
//         return res.status(400).json({ message: 'Invalid IPN payload' });
//       }
  
//       // Find the payment in the DB
//       const payment = await Payment.findOne({ paymentId: payment_id });
//       if (!payment) {
//         return res.status(404).json({ message: 'Payment not found' });
//       }
  
//       // Only process if it's not already marked finished
     
//       if (payment_status === 'confirming') {
//   payment.status = 'confirming';
//   await payment.save();
//   return res.status(200).json({ message: 'Payment is confirming' });
// }
// if (payment_status === 'expired') {
//   payment.status = 'expired';
//   await payment.save();
//   return res.status(200).json({ message: 'Payment has expired' });
// }
// if (payment_status === 'sending') {  
//   payment.status = 'sending';
//   await payment.save();
//   return res.status(200).json({ message: 'Payment is sending' });
// }
//       // If payment is successful, update payment and user's balance
//       if (payment_status === 'finished') {
//         payment.status = 'finished';
//         await payment.save();
  
//         // Credit user's balance
//         const user = await User.findById(payment.user);
//         if (user) {
//           user.balance += payment.amount;
//           await user.save();
//         }
  
//         return res.status(200).json({ message: 'Payment processed and balance updated' });
//       }
  
//       // If failed, mark it failed
//       if (payment_status === 'failed') {
//         payment.status = 'failed';
//         await payment.save();
//         return res.status(200).json({ message: 'Payment marked as failed' });
//       }
  
//       res.status(200).json({ message: 'IPN received, no action taken' });
  
//     } catch (error) {
//       console.error('IPN Error:', error);
//       res.status(500).json({ message: 'Server error processing IPN' });
//     }
//   });

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

//     // ✅ Find payment
//     const payment = await Payment.findOne({ paymentId: payment_id });
//     if (!payment) {
//       return res.status(404).json({ message: 'Payment not found' });
//     }

//     // ✅ Save IPN body for reference
//     payment.transactionDetails = req.body;

//     if (payment.status === 'finished') {
//       return res.status(200).json({ message: 'Payment already processed' });
//     }

//     if (payment_status === 'confirming') {
//       payment.status = 'confirming';
//       await payment.save();
//       return res.status(200).json({ message: 'Payment is confirming' });
//     }

//     if (payment_status === 'expired') {
//       payment.status = 'expired';
//       await payment.save();
//       return res.status(200).json({ message: 'Payment has expired' });
//     }

//     if (payment_status === 'sending') {
//       payment.status = 'sending';
//       await payment.save();
//       return res.status(200).json({ message: 'Payment is sending' });
//     }

//     if (payment_status === 'finished') {
//       payment.status = 'finished';
//       await payment.save();

//       const user = await User.findById(payment.user);
//       if (user) {
//         user.balance += payment.amount;
//         await user.save();
//       }

//       return res.status(200).json({ message: 'Payment processed and balance updated' });
//     }

//     if (payment_status === 'failed') {
//       payment.status = 'failed';
//       await payment.save();
//       return res.status(200).json({ message: 'Payment marked as failed' });
//     }

//     return res.status(200).json({ message: 'IPN received, no action taken' });
//   } catch (error) {
//     console.error('IPN Error:', error);
//     return res.status(500).json({ message: 'Server error processing IPN' });
//   }
// });
router.post('/ipn', async (req, res) => {
  const signature = req.headers['x-nowpayments-sig'];
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;

  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(JSON.stringify(req.body));
  const expectedSignature = hmac.digest('hex');

  if (signature !== expectedSignature) {
    console.warn('Invalid IPN signature');
    return res.status(401).json({ message: 'Unauthorized IPN call' });
  }

  try {
    const { payment_id, payment_status } = req.body;

    if (!payment_id || !payment_status) {
      return res.status(400).json({ message: 'Invalid IPN payload' });
    }

    const payment = await Payment.findOne({ paymentId: payment_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Save full IPN data for audit/debugging
    payment.transactionDetails = req.body;

    // Avoid reprocessing completed payments
    
      
    

    // Handle all statuses
    if (payment_status === 'confirming') {
      payment.status = 'confirming';
    } else if (payment_status === 'expired') {
      payment.status = 'expired';
    } else if (payment_status === 'sending') {
      payment.status = 'sending';
    } else if (payment_status === 'failed') {
      payment.status = 'failed';
    } else if (payment_status === 'finished') {
      payment.status = 'finished';

      // Credit user's balance
      const user = await User.findById(payment.user);
      if (user) {
        user.balance += payment.amount;
        await user.save();
      }
      return res.status(200).json({ message: 'Payment processed and balance updated' });
    } else {
      return res.status(200).json({ message: 'IPN received, no matching action' });
    }

    await payment.save();
    return res.status(200).json({ message: `Payment marked as ${payment.status}` });
  } catch (error) {
    console.error('IPN Error:', error);
    res.status(500).json({ message: 'Server error processing IPN' });
  }
});


module.exports = router;

