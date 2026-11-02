const mongoose = require('mongoose');

const systemPlanTemplateSchema = new mongoose.Schema({
  kind: { type: String, enum: ['workout', 'diet'], required: true, index: true },
  templateCode: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  goal: { type: String, trim: true },
  difficulty: { type: String, trim: true },
  dietPreference: { type: String, trim: true },
  description: { type: String, trim: true },
  note: { type: String, trim: true },
  details: { type: String, trim: true },
  tableRows: { type: [mongoose.Schema.Types.Mixed], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

systemPlanTemplateSchema.index({ kind: 1, category: 1, name: 1 });
systemPlanTemplateSchema.pre('save', function updateTimestamp(next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('SystemPlanTemplate', systemPlanTemplateSchema);
