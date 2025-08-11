// const axios = require("axios");

// const API_KEY = process.env.NOWPAYMENTS_API_KEY;
// const BASE_URL = "https://api.nowpayments.io/v1";

// const headers = {
//   "x-api-key": API_KEY,
//   "Content-Type": "application/json",
// };

// async function createPayment(amount, userId) {
//   const response = await axios.post(
//     `${BASE_URL}/payment`,
//     {
//       price_amount: amount,
//       price_currency: "usd",
//       pay_currency: "usdttrc20", // Change if needed (e.g., usdtbep20)
//       ipn_callback_url: "https://cryptoinvests-api.onrender.com/api/payments/ipn",
//       order_description: "Crypto funding (USDT)",
//       order_id: userId, // Attach user ID here
//     },
//     { headers }
//   );

//   return response.data;
// }

// module.exports = { createPayment };
// services/nowpay.js
const axios = require("axios");

const NP_API_KEY   = process.env.NOWPAYMENTS_API_KEY;                    // REQUIRED
const NP_BASE_URL  = process.env.NOWPAYMENTS_API_BASE || "https://api.nowpayments.io/v1"; // sandbox: https://api-sandbox.nowpayments.io/v1
const IPN_URL      = process.env.NOWPAY_IPN_URL;                         // e.g. https://api.yourapp.com/api/payments/ipn
const SUCCESS_URL  = process.env.NOWPAY_SUCCESS_URL;                     // e.g. https://yourapp.com/wallet/success
const CANCEL_URL   = process.env.NOWPAY_CANCEL_URL;                      // e.g. https://yourapp.com/wallet/cancel
const BASE_CCY     = process.env.NOWPAY_BASE_CURRENCY || "usd";          // what your "amount" represents
const PAY_CCY      = process.env.NOWPAY_PAY_CURRENCY  || "usdttrc20";    // crypto user pays with

const headers = {
  "x-api-key": NP_API_KEY,
  "Content-Type": "application/json",
};

function toPriceNumber(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) throw new Error("Invalid amount");
  // Optional: round to 2 decimals for fiat
  return Math.round(x * 100) / 100;
}

/**
 * Create a NOWPayments payment.
 * @param {number|string} amount  Fiat/base amount (e.g., 50 USD) you will credit upon 'finished'
 * @param {string} userId         Your user ID (for building order_id)
 * @param {object} options        { orderId?: string, sandboxCase?: 'success'|'failed'|'partially_paid' }
 */
async function createPayment(amount, userId, options = {}) {
  const price_amount = toPriceNumber(amount);
  if (!userId) throw new Error("userId is required");
  if (!NP_API_KEY) throw new Error("NOWPAYMENTS_API_KEY is missing");
  if (!IPN_URL) throw new Error("NOWPAY_IPN_URL is missing");
  if (!SUCCESS_URL || !CANCEL_URL) throw new Error("NOWPAY_SUCCESS_URL / NOWPAY_CANCEL_URL missing");

  const orderId = options.orderId || `TOPUP-${userId}-${Date.now()}`;

  const payload = {
    price_amount,
    price_currency: BASE_CCY,
    pay_currency: PAY_CCY,
    ipn_callback_url: IPN_URL,
    order_id: orderId,
    order_description: "Account funding",
    success_url: SUCCESS_URL,
    cancel_url: CANCEL_URL,
    // For sandbox testing only (ignored in prod):
    ...(options.sandboxCase ? { case: options.sandboxCase } : {}),
  };

  try {
    const res = await axios.post(`${NP_BASE_URL}/payment`, payload, {
      headers,
      timeout: 15000,
    });
    // Typical fields: payment_id, pay_address, pay_amount, invoice_url, order_id
    return res.data;
  } catch (err) {
    // Surface useful context to your logs
    console.error("NOWPayments create error:", err?.response?.data || err.message);
    throw new Error("Failed to create NOWPayments payment");
  }
}

module.exports = { createPayment };
