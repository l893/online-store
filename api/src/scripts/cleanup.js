const mongoose = require('mongoose');
const { mongoUri } = require('../config/env');
const RefreshToken = require('../modules/auth/refresh-token.model');

async function cleanupExpiredTokens() {
  try {
    await mongoose.connect(mongoUri);
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    console.log(`🧹 Cleaned up ${result.deletedCount} expired refresh tokens`);
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanupExpiredTokens();
