require('dotenv').config();

const connectDB = require('./config/database');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const app = createApp();
  return app.listen(PORT, () => {
    console.log(`FitLedger API listening on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start FitLedger API', error);
    process.exit(1);
  });
}

module.exports = { startServer };
