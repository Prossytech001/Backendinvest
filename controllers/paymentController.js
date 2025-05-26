// const axios = require('axios');
// const Payment = require('../model/Payment');

// exports.createPayment = async (req, res) => {
//   try {
//     const { userId, amount } = req.body;

//     const response = await axios.post(
//       'https://api.nowpayments.io/v1/payment',
//       {
//         price_amount: amount,
//         price_currency: 'usd',
//         pay_currency: 'usdttrc20',
//         order_id: userId, // ✅ attach user ID here
//         ipn_callback_url: 'https://cryptoinvests-api.onrender.com/api/payments/ipn', // replace with your domain
//         order_description: 'Crypto funding (USDT)',
//       },
//       {
//         headers: {
//           'x-api-key': process.env.NOWPAYMENTS_API_KEY,
//         },
//       }
//     );

//     const payment = new Payment({
//       user: userId,
//       amount,
//       currency: 'usd',
//       cryptoCurrency: 'usdttrc20',
//       paymentId: response.data.payment_id,
//       status: response.data.payment_status
//     });

//     await payment.save();

//     res.status(200).json({ url: response.data.invoice_url });
//   } catch (error) {
//     console.error('Payment error:', error.message);
//     res.status(500).json({ message: 'Could not start payment', error: error.message });
//   }
// };
const axios = require('axios');
const Payment = require('../model/Payment');

exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id; // ✅ safer — from token

    const response = await axios.post(
      'https://api.nowpayments.io/v1/payment',
      {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        order_id: userId,
        ipn_callback_url: 'https://cryptoinvests-api.onrender.com/api/payments/ipn',
        order_description: 'Crypto funding (USDT)',
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        },
      }
    );

    const payment = new Payment({
      user: userId, // ✅ saved correctly
      amount,
      currency: 'usd',
      cryptoCurrency: 'usdttrc20',
      paymentId: response.data.payment_id,
      payAddress: response.data.pay_address,
      invoiceUrl: response.data.invoice_url, // ✅ now saved
      status: response.data.payment_status,
    });

    await payment.save();

    res.status(200).json({ url: response.data.invoice_url }); // ✅ still returned to frontend
  } catch (error) {
    console.error('Payment error:', error.message);
    res.status(500).json({ message: 'Could not start payment', error: error.message });
  }
};
