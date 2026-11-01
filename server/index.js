require('dotenv').config();

const connectDB = require('./config/database');
const { createApp } = require('./app');
const { startExpiryReminderScheduler } = require('./services/emailAutomationService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  startExpiryReminderScheduler();
  const app = createApp();
  return app.listen(PORT, () => {
    console.log(`FitSaarthi API listening on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start FitSaarthi API', error);
    process.exit(1);
  });
}

module.exports = { startServer };
