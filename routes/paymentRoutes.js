const express = require("express");
const router = express.Router();
const User = require('../model/User');
const Payment = require("../model/Payment");
const { createPayment } = require("../utils/nowPayments");
require('dotenv').config();

router.post("/create", async (req, res) => {
  try {
    const { amount, userId } = req.body;

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
    });
  } catch (err) {
    console.error("Payment error:", err.message);
    res.status(500).json({ success: false, error: "Failed to create payment." });
  }
});

// IPN callback route (must match the URL set in NOWPayments IPN settings)
router.post('/ipn', async (req, res) => {
    try {
      const { payment_id, payment_status } = req.body;
  
      if (!payment_id || !payment_status) {
        return res.status(400).json({ message: 'Invalid IPN payload' });
      }
  
      // Find the payment in the DB
      const payment = await Payment.findOne({ paymentId: payment_id });
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
  
      // Only process if it's not already marked finished
      if (payment.status === 'finished') {
        return res.status(200).json({ message: 'Payment already processed' });
      }
  
      // If payment is successful, update payment and user's balance
      if (payment_status === 'finished') {
        payment.status = 'finished';
        await payment.save();
  
        // Credit user's balance
        const user = await User.findById(payment.user);
        if (user) {
          user.balance += payment.amount;
          await user.save();
        }
  
        return res.status(200).json({ message: 'Payment processed and balance updated' });
      }
  
      // If failed, mark it failed
      if (payment_status === 'failed') {
        payment.status = 'failed';
        await payment.save();
        return res.status(200).json({ message: 'Payment marked as failed' });
      }
  
      res.status(200).json({ message: 'IPN received, no action taken' });
  
    } catch (error) {
      console.error('IPN Error:', error);
      res.status(500).json({ message: 'Server error processing IPN' });
    }
  });

module.exports = router;

