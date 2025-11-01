const jwt = require('jsonwebtoken');
const { accessSecret, refreshSecret } = require('../config/env');

function signAccess(payload, opts = {}) {
  return jwt.sign(payload, accessSecret, { expiresIn: '10m', ...opts });
}
function signRefresh(payload, opts = {}) {
  return jwt.sign(payload, refreshSecret, { expiresIn: '30d', ...opts });
}
function verifyAccess(token) {
  return jwt.verify(token, accessSecret);
}
function verifyRefresh(token) {
  return jwt.verify(token, refreshSecret);
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
