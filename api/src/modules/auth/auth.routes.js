const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('./user.model');
const RefreshToken = require('./refresh-token.model');
const { signAccess, signRefresh, verifyRefresh } = require('../../shared/jwt');
const {
  isMongoDuplicateKeyError,
} = require('../../shared/is-mongo-duplicate-key-error');

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_TOKEN_LIFETIME_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

function getRefreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  };
}

function setRefreshCookie(response, refreshToken) {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: REFRESH_TOKEN_LIFETIME_MILLISECONDS,
  });
}

function clearRefreshCookie(response) {
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions());
}

function rejectRefreshRequest(response, message) {
  clearRefreshCookie(response);

  return response.status(401).json({
    message,
  });
}

async function revokeUserRefreshSessions(userId) {
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

async function createRefreshToken(userId, userAgent, ipAddress) {
  const refreshTokenIdentifier = crypto.randomUUID();
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

function createAuthenticatedUserResponse(userDocument) {
  return {
    id: userDocument._id,
    email: userDocument.email,
    name: userDocument.name,
    roles: userDocument.roles,
  };
}

function sendEmailConflictResponse(response) {
  return response.status(409).json({
    code: 'AUTH_EMAIL_CONFLICT',
    message: 'Email already registered',
  });
}

async function establishAuthenticatedSession({
  userDocument,
  request,
  response,
}) {
  const accessToken = signAccess({
    sub: userDocument._id.toString(),
    roles: userDocument.roles,
  });
  const refreshToken = await createRefreshToken(
    userDocument._id,
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
    const { email, password, name } = request.body || {};

    if (!email || !password) {
      return response.status(400).json({
        message: 'email & password required',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendEmailConflictResponse(response);
    }

    const passwordHash = await bcrypt.hash(password, 11);
    const userDocument = await User.create({
      email,
      passwordHash,
      name,
      roles: ['user'],
    });

    return establishAuthenticatedSession({
      userDocument,
      request,
      response,
    });
  } catch (error) {
    if (isMongoDuplicateKeyError(error, 'email')) {
      return sendEmailConflictResponse(response);
    }

    nextMiddleware(error);
  }
});

router.post('/login', async (request, response, nextMiddleware) => {
  try {
    const { email, password } = request.body || {};
    const userDocument = await User.findOne({ email });

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
  } catch (error) {
    nextMiddleware(error);
  }
});

router.post('/refresh', async (request, response, nextMiddleware) => {
  try {
    const refreshCookie = request.cookies?.refreshToken;

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
  } catch (error) {
    nextMiddleware(error);
  }
});

router.post('/logout', async (request, response, nextMiddleware) => {
  try {
    const refreshCookie = request.cookies?.refreshToken;

    if (refreshCookie) {
      try {
        const refreshTokenPayload = verifyRefresh(refreshCookie);

        await RefreshToken.deleteMany({
          userId: refreshTokenPayload.sub,
        });
      } catch (error) {
        console.error('Logout cleanup error:', error.message);
      }
    }

    clearRefreshCookie(response);
    response.json({ ok: true });
  } catch (error) {
    nextMiddleware(error);
  }
});

module.exports = router;
