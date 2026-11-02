const mongoose = require('mongoose');

const planShareLinkSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  assignmentIds: {
    assignmentKey: { type: String, required: true },
    workoutPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan' },
    dietPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'DietPlan' },
  },
  assignmentFingerprint: { type: String, required: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  workoutPlan: { type: mongoose.Schema.Types.Mixed },
  dietPlan: { type: mongoose.Schema.Types.Mixed },
  isActive: { type: Boolean, default: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  emailStatus: { type: String, enum: ['not_sent', 'sent', 'failed', 'unknown'], default: 'not_sent' },
  emailAttempts: { type: Number, default: 0 },
  emailSentAt: { type: Date },
  emailError: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

planShareLinkSchema.index({ gymId: 1, memberId: 1, assignmentFingerprint: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
planShareLinkSchema.pre('save', function updateTimestamp(next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('PlanShareLink', planShareLinkSchema);
