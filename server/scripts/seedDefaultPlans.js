require('dotenv').config();

const connectDB = require('../config/database');
const SystemPlanTemplate = require('../models/SystemPlanTemplate');
const { templates } = require('../data/defaultPlanTemplates');

const seedDefaultPlans = async () => {
  await connectDB();
  await Promise.all(templates.map((template) => SystemPlanTemplate.updateOne(
    { templateCode: template.templateCode },
    { $setOnInsert: { ...template, createdAt: new Date(), updatedAt: new Date() } },
    { upsert: true }
  )));
  console.log(`Default fitness plan templates are available (${templates.length}).`);
};

if (require.main === module) {
  seedDefaultPlans().then(() => process.exit(0)).catch((error) => {
    console.error('Unable to seed default plans:', error.message);
    process.exit(1);
  });
}

module.exports = { seedDefaultPlans };
