const mongoose = require('mongoose');

const dietRowSchema = new mongoose.Schema({
  time: { type: String, trim: true },
  meal: { type: String, trim: true },
  food: { type: String, trim: true },
  quantity: { type: String, trim: true },
  calories: { type: String, trim: true },
  protein: { type: String, trim: true },
  instructions: { type: String, trim: true }
}, { _id: false });

const dietPlanSchema = new mongoose.Schema({
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
  dietPreference: { type: String, trim: true },
  templateCode: { type: String, trim: true },
  isCustomized: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tableRows: {
    type: [dietRowSchema],
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

dietPlanSchema.index({ gymId: 1, name: 1 }, { unique: true });
dietPlanSchema.index({ gymId: 1, templateCode: 1 }, { unique: true, sparse: true });

dietPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
