const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('./user.model');
const Cart = require('../cart/cart.model');
const RefreshToken = require('./refresh-token.model');
const { signAccess, signRefresh, verifyRefresh } = require('../../shared/jwt');

const COOKIE_NAME = 'refreshToken'; // httpOnly cookie
const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_TOKEN_LIFETIME_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

// helpers
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
  response.cookie(COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: REFRESH_TOKEN_LIFETIME_MILLISECONDS,
  });
}

function clearRefreshCookie(response) {
  response.clearCookie(COOKIE_NAME, getRefreshCookieOptions());
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

async function createRefresh(userId, ua, ip) {
  const jti = crypto.randomUUID();
  const token = signRefresh({ sub: userId, jti });

  await RefreshToken.create({
    userId,
    jti,
    userAgent: ua,
    ip,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MILLISECONDS),
  });

  return token;
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: 'email & password required' });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 11);
    const user = await User.create({
      email,
      passwordHash,
      name,
      roles: ['user'],
    });

    const accessToken = signAccess({
      sub: user._id.toString(),
      roles: user.roles,
    });

    const refreshToken = await createRefresh(
      user._id,
      req.headers['user-agent'] || '',
      req.ip,
    );

    setRefreshCookie(res, refreshToken);
    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccess({
      sub: user._id.toString(),
      roles: user.roles,
    });
    const refreshToken = await createRefresh(
      user._id,
      req.headers['user-agent'] || '',
      req.ip,
    );

    setRefreshCookie(res, refreshToken);
    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', async (request, response, next) => {
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

    const user = await User.findById(refreshTokenPayload.sub);

    if (!user) {
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

    const refreshToken = await createRefresh(
      refreshTokenPayload.sub,
      request.headers['user-agent'] || '',
      request.ip,
    );
    setRefreshCookie(response, refreshToken);

    const accessToken = signAccess({
      sub: user._id.toString(),
      roles: user.roles,
    });

    return response.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const cookie = req.cookies?.refreshToken;
    if (cookie) {
      try {
        const payload = verifyRefresh(cookie);

        // Удаляем все токены текущего пользователя
        await RefreshToken.deleteMany({ userId: payload.sub });

        // Очистка пустых корзин
        const cart = await Cart.findOne({ userId: payload.sub });
        if (cart && (!cart.items || cart.items.length === 0)) {
          await Cart.deleteOne({ userId: payload.sub });
          console.log(`🧺 Removed empty cart for user ${payload.sub}`);
        }
      } catch (err) {
        console.error('Logout cleanup error:', err.message);
      }
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
