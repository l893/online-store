require('dotenv').config();

const cfg = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shop',
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh',
};

module.exports = cfg;
