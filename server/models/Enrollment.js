const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  email: { type: String, lowercase: true, trim: true },
  dateOfBirth: Date,
  address: { type: String, trim: true },
  emergencyContactNumber: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
