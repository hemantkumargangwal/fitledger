const mongoose = require('mongoose');

const passwordResetChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
    select: false,
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  consumedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

passwordResetChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetChallengeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PasswordResetChallenge', passwordResetChallengeSchema);
