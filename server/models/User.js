const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  resetPasswordOtpHash: {
    type: String,
    default: null
  },
  resetPasswordOtpExpires: {
    type: Date,
    default: null
  },
  resetPasswordOtpAttempts: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['owner', 'staff'],
    default: 'owner'
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIssuedAt;
};

module.exports = mongoose.model('User', userSchema);
