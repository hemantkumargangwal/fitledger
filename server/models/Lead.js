const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  notes: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['Inquiry', 'Follow-up', 'Trial', 'Converted', 'Lost'], default: 'Inquiry', index: true },
  convertedAt: { type: Date },
}, { timestamps: true });

leadSchema.index({ gymId: 1, status: 1, updatedAt: -1 });
module.exports = mongoose.model('Lead', leadSchema);
