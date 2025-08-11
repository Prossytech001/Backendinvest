// const mongoose = require("mongoose");

// const paymentSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     amount: { type: Number, required: true },
//     currency: { type: String, default: "usdt" },
// status: {
//   type: String,
//   enum: [
//     'waiting','confirming','confirmed','partially_paid',
//     'finished','failed','refunded','expired','sending'
//   ],
//   default: 'waiting'
// },
//     paymentId: { type: String, unique: true },
//    payAddress: { type: String },
//     invoiceUrl: { type: String }, // ✅ Add this field

//     transactionDetails: Object,
//     receivedAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Payment", paymentSchema);
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },          // fiat/base amount you credit on 'finished'
    currency: { type: String, default: "usdt" },

    status: {
      type: String,
      enum: [
        'waiting','confirming','confirmed','partially_paid',
        'finished','failed','refunded','expired','sending'
      ],
      default: 'waiting'
    },

    paymentId: { type: String, unique: true, index: true },
    payAddress: String,
    invoiceUrl: String,

    // audit / reconciliation
    payCurrency: String,     // from IPN
    payAmount: Number,       // from IPN
    actuallyPaid: Number,    // from IPN
    transactionDetails: Object,
    actuallyPaid: Number,
    // idempotency guard
    creditedAt: Date,

    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
