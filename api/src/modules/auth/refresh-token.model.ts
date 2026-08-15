import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    jti: { type: String, index: true }, // уникальный id токена
    expiresAt: { type: Date, index: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true },
);

export type RefreshTokenRecord = InferSchemaType<typeof refreshTokenSchema>;

const RefreshToken = model<RefreshTokenRecord>(
  'RefreshToken',
  refreshTokenSchema,
);

export default RefreshToken;
