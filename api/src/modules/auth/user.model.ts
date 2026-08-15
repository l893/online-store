import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

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

export type UserRecord = InferSchemaType<typeof userSchema>;

const User = model<UserRecord>('User', userSchema);

export default User;
