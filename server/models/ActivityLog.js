const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  action: {
    type: String,
    enum: ['member_joined', 'member_updated', 'member_renewed', 'payment_received', 'member_deleted'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

activityLogSchema.index({ gymId: 1, createdAt: -1 });
activityLogSchema.index({ memberId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
