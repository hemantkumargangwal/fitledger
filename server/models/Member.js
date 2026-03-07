const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  planDuration: {
    type: Number,
    required: true,
    min: 1
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate expiry date before saving
memberSchema.pre('save', function(next) {
  if (this.isModified('planDuration') || this.isModified('joiningDate')) {
    const expiryDate = new Date(this.joiningDate);
    expiryDate.setMonth(expiryDate.getMonth() + this.planDuration);
    this.expiryDate = expiryDate;
  }
  
  // Update status based on expiry date
  if (this.expiryDate < new Date()) {
    this.status = 'expired';
  } else {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Member', memberSchema);
