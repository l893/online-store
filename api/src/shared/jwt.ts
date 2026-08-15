import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import { accessSecret, refreshSecret } from '../config/env.js';

export interface AccessTokenClaims {
  readonly sub: string;
  readonly roles?: readonly string[];
}

export interface RefreshTokenClaims {
  readonly sub: string;
  readonly jti: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => typeof item === 'string')
  );
}

export function signAccess(
  payload: AccessTokenClaims,
  options: SignOptions = {},
): string {
  return jwt.sign(payload, accessSecret, {
    expiresIn: '10m',
    ...options,
  });
}

export function signRefresh(
  payload: RefreshTokenClaims,
  options: SignOptions = {},
): string {
  return jwt.sign(payload, refreshSecret, {
    expiresIn: '30d',
    ...options,
  });
}

export function verifyAccess(token: string): AccessTokenClaims {
  const verifiedPayload: unknown = jwt.verify(token, accessSecret);

  if (
    !isRecord(verifiedPayload) ||
    typeof verifiedPayload.sub !== 'string' ||
    (verifiedPayload.roles !== undefined &&
      !isStringArray(verifiedPayload.roles))
  ) {
    throw new Error('Invalid access token payload');
  }

  return verifiedPayload.roles === undefined
    ? {
        sub: verifiedPayload.sub,
      }
    : {
        sub: verifiedPayload.sub,
        roles: verifiedPayload.roles,
      };
}

export function verifyRefresh(token: string): RefreshTokenClaims {
  const verifiedPayload: unknown = jwt.verify(token, refreshSecret);

  if (
    !isRecord(verifiedPayload) ||
    typeof verifiedPayload.sub !== 'string' ||
    typeof verifiedPayload.jti !== 'string'
  ) {
    throw new Error('Invalid refresh token payload');
  }

  return {
    sub: verifiedPayload.sub,
    jti: verifiedPayload.jti,
  };
}
