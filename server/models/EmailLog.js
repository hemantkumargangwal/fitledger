const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  eventType: { type: String, required: true, index: true },
  membershipPeriodKey: { type: String },
  recipientEmail: { type: String, required: true, lowercase: true, trim: true },
  templateId: { type: String, required: true },
  variables: { type: mongoose.Schema.Types.Mixed, default: {} },
  dedupeKey: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'sent', 'failed', 'unknown', 'cancelled'], default: 'pending', index: true },
  attempts: { type: Number, default: 0 },
  providerMessageId: { type: String },
  providerResponse: { type: mongoose.Schema.Types.Mixed },
  lastError: { type: String },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { minimize: false });

emailLogSchema.index({ gymId: 1, memberId: 1, eventType: 1, membershipPeriodKey: 1 });
emailLogSchema.pre('save', function updateTimestamp(next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('EmailLog', emailLogSchema);
