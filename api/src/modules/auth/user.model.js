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
      maxlength: 254,
    },
    passwordHash: { type: String, required: true },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    roles: { type: [String], default: ['user'] }, // 'user' | 'admin'
  },
  { timestamps: true },
);

module.exports = model('User', userSchema);
