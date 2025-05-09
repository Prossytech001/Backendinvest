// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  cryptoCurrency: { type: String, required: true }, // e.g., usdttrc20
  paymentId: { type: String, required: true, unique: true },
  status: { type: String, default: 'waiting' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
