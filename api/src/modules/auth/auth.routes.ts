import { randomUUID } from 'node:crypto';

import bcrypt from 'bcrypt';
import { Router } from 'express';
import type { CookieOptions, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import { signAccess, signRefresh, verifyRefresh } from '../../shared/jwt.js';
import { isMongoDuplicateKeyError } from '../../shared/is-mongo-duplicate-key-error.js';
import RefreshToken from './refresh-token.model.js';
import User from './user.model.js';
import type { UserRecord } from './user.model.js';

interface RegistrationLengthInput {
  readonly emailAddress: string;
  readonly userName?: string;
  readonly password: string;
}

type SessionUserDocument = HydratedDocument<UserRecord>;

interface AuthenticationUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name?: string;
  readonly roles: readonly string[];
}

interface AuthenticationRequestMetadata {
  readonly headers: {
    readonly 'user-agent'?: string;
  };
  readonly ip?: string;
}

interface EstablishAuthenticatedSessionOptions {
  readonly userDocument: SessionUserDocument;
  readonly request: AuthenticationRequestMetadata;
  readonly response: Response;
}

const router = Router();

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_TOKEN_LIFETIME_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
const AUTH_EMAIL_MAX_LENGTH = 254;
const AUTH_NAME_MAX_LENGTH = 100;
const AUTH_PASSWORD_MAX_BYTE_LENGTH = 72;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRequestBody(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getRefreshCookie(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const refreshCookie = value[REFRESH_TOKEN_COOKIE_NAME];

  return typeof refreshCookie === 'string' && refreshCookie
    ? refreshCookie
    : undefined;
}

function isAuthenticationPasswordWithinByteLengthLimit(
  passwordValue: unknown,
): passwordValue is string {
  return (
    typeof passwordValue === 'string' &&
    Buffer.byteLength(passwordValue, 'utf8') <= AUTH_PASSWORD_MAX_BYTE_LENGTH
  );
}

function isRegistrationInputTooLong({
  emailAddress,
  userName,
  password,
}: RegistrationLengthInput): boolean {
  return (
    emailAddress.length > AUTH_EMAIL_MAX_LENGTH ||
    (userName?.length || 0) > AUTH_NAME_MAX_LENGTH ||
    !isAuthenticationPasswordWithinByteLengthLimit(password)
  );
}

function normalizeEmailAddress(emailAddress: unknown): string {
  return typeof emailAddress === 'string'
    ? emailAddress.trim().toLowerCase()
    : '';
}

function normalizeUserName(userName: unknown): string | undefined {
  if (typeof userName !== 'string') {
    return undefined;
  }

  const normalizedUserName = userName.trim();

  return normalizedUserName || undefined;
}

function getRefreshCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  };
}

function setRefreshCookie(response: Response, refreshToken: string): void {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: REFRESH_TOKEN_LIFETIME_MILLISECONDS,
  });
}

function clearRefreshCookie(response: Response): void {
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions());
}

function rejectRefreshRequest(response: Response, message: string): Response {
  clearRefreshCookie(response);

  return response.status(401).json({
    message,
  });
}

async function revokeUserRefreshSessions(userId: string): Promise<void> {
  await RefreshToken.updateMany(
    {
      userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
}

async function createRefreshToken(
  userId: string,
  userAgent: string,
  ipAddress: string | undefined,
): Promise<string> {
  const refreshTokenIdentifier = randomUUID();
  const refreshToken = signRefresh({
    sub: userId,
    jti: refreshTokenIdentifier,
  });

  await RefreshToken.create({
    userId,
    jti: refreshTokenIdentifier,
    userAgent,
    ip: ipAddress,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MILLISECONDS),
  });

  return refreshToken;
}

function createAuthenticatedUserResponse(
  userDocument: SessionUserDocument,
): AuthenticationUserResponse {
  return {
    id: userDocument._id.toString(),
    email: userDocument.email,
    name: userDocument.name ?? undefined,
    roles: userDocument.roles,
  };
}

function sendEmailConflictResponse(response: Response): Response {
  return response.status(409).json({
    code: 'AUTH_EMAIL_CONFLICT',
    message: 'Email already registered',
  });
}

async function establishAuthenticatedSession({
  userDocument,
  request,
  response,
}: EstablishAuthenticatedSessionOptions): Promise<Response> {
  const userId = userDocument._id.toString();

  const accessToken = signAccess({
    sub: userId,
    roles: userDocument.roles,
  });
  const refreshToken = await createRefreshToken(
    userId,
    request.headers['user-agent'] || '',
    request.ip,
  );

  setRefreshCookie(response, refreshToken);

  return response.json({
    accessToken,
    user: createAuthenticatedUserResponse(userDocument),
  });
}

router.post('/register', async (request, response, nextMiddleware) => {
  try {
    const { email, password, name } = getRequestBody(request.body);
    const normalizedEmail = normalizeEmailAddress(email);
    const normalizedName = normalizeUserName(name);

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return response.status(400).json({
        message: 'email & password required',
      });
    }

    if (
      isRegistrationInputTooLong({
        emailAddress: normalizedEmail,
        userName: normalizedName,
        password,
      })
    ) {
      return response.status(400).json({
        code: 'AUTH_INPUT_TOO_LONG',
        message: 'Authentication input exceeds allowed length',
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return sendEmailConflictResponse(response);
    }

    const passwordHash = await bcrypt.hash(password, 11);
    const userDocument = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: normalizedName,
      roles: ['user'],
    });

    return establishAuthenticatedSession({
      userDocument,
      request,
      response,
    });
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error, 'email')) {
      return sendEmailConflictResponse(response);
    }

    nextMiddleware(error);
  }
});

router.post('/login', async (request, response, nextMiddleware) => {
  try {
    const { email, password } = getRequestBody(request.body);
    const normalizedEmail = normalizeEmailAddress(email);

    if (
      !normalizedEmail ||
      typeof password !== 'string' ||
      !password ||
      normalizedEmail.length > AUTH_EMAIL_MAX_LENGTH ||
      !isAuthenticationPasswordWithinByteLengthLimit(password)
    ) {
      return response.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const userDocument = await User.findOne({
      email: normalizedEmail,
    });

    if (!userDocument) {
      return response.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userDocument.passwordHash,
    );

    if (!isPasswordValid) {
      return response.status(401).json({
        message: 'Invalid credentials',
      });
    }

    return establishAuthenticatedSession({
      userDocument,
      request,
      response,
    });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

router.post('/refresh', async (request, response, nextMiddleware) => {
  try {
    const refreshCookie = getRefreshCookie(request.cookies);

    if (!refreshCookie) {
      return rejectRefreshRequest(response, 'No refresh cookie');
    }

    let refreshTokenPayload;

    try {
      refreshTokenPayload = verifyRefresh(refreshCookie);
    } catch {
      return rejectRefreshRequest(response, 'Invalid refresh token');
    }

    const userDocument = await User.findById(refreshTokenPayload.sub);

    if (!userDocument) {
      await RefreshToken.deleteMany({
        userId: refreshTokenPayload.sub,
      });

      return rejectRefreshRequest(response, 'Session user not found');
    }

    const storedRefreshToken = await RefreshToken.findOneAndUpdate(
      {
        jti: refreshTokenPayload.jti,
        userId: refreshTokenPayload.sub,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
      {
        new: false,
      },
    );

    if (!storedRefreshToken) {
      const knownRefreshToken = await RefreshToken.exists({
        jti: refreshTokenPayload.jti,
        userId: refreshTokenPayload.sub,
      });

      await revokeUserRefreshSessions(refreshTokenPayload.sub);

      return rejectRefreshRequest(
        response,
        knownRefreshToken
          ? 'Refresh token reuse detected'
          : 'Refresh not found',
      );
    }

    return establishAuthenticatedSession({
      userDocument,
      request,
      response,
    });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

router.post('/logout', async (request, response, nextMiddleware) => {
  try {
    const refreshCookie = getRefreshCookie(request.cookies);

    if (refreshCookie) {
      try {
        const refreshTokenPayload = verifyRefresh(refreshCookie);

        await RefreshToken.deleteMany({
          userId: refreshTokenPayload.sub,
        });
      } catch (error: unknown) {
        console.error(
          'Logout cleanup error:',
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    clearRefreshCookie(response);
    response.json({ ok: true });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

export default router;
