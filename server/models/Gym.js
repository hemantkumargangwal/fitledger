const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: true,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  trialStartsAt: {
    type: Date,
    default: Date.now
  },
  trialEndsAt: {
    type: Date,
    default: () => {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 90);
      return trialEndsAt;
    }
  },
  trialDurationDays: {
    type: Number,
    default: 90
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gym', gymSchema);
