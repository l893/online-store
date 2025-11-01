const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    roles: { type: [String], default: ['user'] }, // 'user' | 'admin'
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
