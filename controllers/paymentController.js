const axios = require('axios');
const Payment = require('../model/Payment');

exports.createPayment = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const response = await axios.post(
      'https://api.nowpayments.io/v1/payment',
      {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        ipn_callback_url: 'https://yourdomain.com/api/payments/ipn', // replace with your domain
        order_description: 'Crypto funding (USDT)',
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        },
      }
    );

    const payment = new Payment({
      user: userId,
      amount,
      currency: 'usd',
      cryptoCurrency: 'usdttrc20',
      paymentId: response.data.payment_id,
      status: response.data.payment_status
    });

    await payment.save();

    res.status(200).json({ url: response.data.invoice_url });
  } catch (error) {
    console.error('Payment error:', error.message);
    res.status(500).json({ message: 'Could not start payment', error: error.message });
  }
};
