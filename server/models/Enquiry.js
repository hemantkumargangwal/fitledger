const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  mobile: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  sender: { type: String, trim: true },
  source: { type: String, trim: true },
  assignedTo: { type: String, trim: true },
  occupation: { type: String, trim: true },
  suitableTimeSlot: { type: String, trim: true },
  nextFollowUp: { type: Date },
  convertibilityNote: { type: String, trim: true },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed', 'converted'],
    default: 'open'
  },
  enquiryDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

enquirySchema.index({ gymId: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
