const mongoose = require('mongoose');

const dietRowSchema = new mongoose.Schema({
  time: { type: String, trim: true },
  meal: { type: String, trim: true },
  food: { type: String, trim: true },
  quantity: { type: String, trim: true },
  calories: { type: String, trim: true }
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

dietPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
