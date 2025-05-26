const express = require("express");
const router = express.Router();
const User = require('../model/User');
const Payment = require("../model/Payment");
const { createPayment } = require("../utils/nowPayments");
require('dotenv').config();
const crypto = require('crypto');
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, async (req, res) => {
  try {
    const { amount } = req.body;
const userId = req.user.id;

   console.log("👉 Received payment creation for user:", userId);
    console.log("👉 Amount:", amount);
     
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

