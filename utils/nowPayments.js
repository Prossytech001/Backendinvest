const axios = require("axios");

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const BASE_URL = "https://api.nowpayments.io/v1";

const headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json",
};

async function createPayment(amount, userId) {
  const response = await axios.post(
    `${BASE_URL}/payment`,
    {
      price_amount: amount,
      price_currency: "usd",
      pay_currency: "usdttrc20", // Change if needed (e.g., usdtbep20)
      ipn_callback_url: "https://cryptoinvests-api.onrender.com/api/payments/ipn",
      order_description: "Crypto funding (USDT)",
    },
    { headers }
  );

  return response.data;
}

module.exports = { createPayment };
