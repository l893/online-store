const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    roles: { type: [String], default: ['user'] }, // 'user' | 'admin'
  },
  { timestamps: true },
);

module.exports = model('User', userSchema);
