const mongoose = require('mongoose');

const planRowSchema = new mongoose.Schema({
  day: { type: String, trim: true },
  exercise: { type: String, trim: true },
  sets: { type: String, trim: true },
  reps: { type: String, trim: true },
  rest: { type: String, trim: true },
  instructions: { type: String, trim: true }
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  note: {
    type: String,
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  category: { type: String, trim: true },
  goal: { type: String, trim: true },
  difficulty: { type: String, trim: true },
  templateCode: { type: String, trim: true },
  isCustomized: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tableRows: {
    type: [planRowSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

workoutPlanSchema.index({ gymId: 1, name: 1 }, { unique: true });
workoutPlanSchema.index({ gymId: 1, templateCode: 1 }, { unique: true, sparse: true });

workoutPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
