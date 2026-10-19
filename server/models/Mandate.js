const mongoose = require('mongoose');
const mandateSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true }, memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  status: { type: String, enum: ['active', 'paused'], default: 'active' }, amount: { type: Number, default: 0 }, cycle: { type: String, default: 'monthly' }, nextDebitDate: Date,
  deductions: [{ date: Date, amount: Number, status: String }],
}, { timestamps: true });
mandateSchema.index({ gymId: 1, memberId: 1 }, { unique: true });
module.exports = mongoose.model('Mandate', mandateSchema);
