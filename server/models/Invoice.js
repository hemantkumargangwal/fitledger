const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: { type: String, required: true }, invoiceNumber: { type: String, required: true },
  baseAmount: Number, duration: Number, cgst: Number, sgst: Number, totalAmount: Number,
  status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
}, { timestamps: true });
invoiceSchema.index({ gymId: 1, invoiceNumber: 1 }, { unique: true });
module.exports = mongoose.model('Invoice', invoiceSchema);
