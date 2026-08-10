require('dotenv').config();

const MINIMUM_JWT_SECRET_LENGTH = 32;
const isProduction = process.env.NODE_ENV === 'production';

function getJwtSecret(environmentVariableName, developmentFallback) {
  const configuredSecret = process.env[environmentVariableName];

  if (!isProduction) {
    return configuredSecret || developmentFallback;
  }

  if (!configuredSecret) {
    throw new Error(`${environmentVariableName} is required in production`);
  }

  if (configuredSecret.length < MINIMUM_JWT_SECRET_LENGTH) {
    throw new Error(
      `${environmentVariableName} must contain at least ${MINIMUM_JWT_SECRET_LENGTH} characters in production`,
    );
  }

  return configuredSecret;
}

const accessSecret = getJwtSecret('JWT_ACCESS_SECRET', 'dev_access');
const refreshSecret = getJwtSecret('JWT_REFRESH_SECRET', 'dev_refresh');

if (isProduction && accessSecret === refreshSecret) {
  throw new Error(
    'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different in production',
  );
}

const cfg = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shop',
  accessSecret,
  refreshSecret,
};

module.exports = cfg;
