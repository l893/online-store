const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('./user.model');
const RefreshToken = require('./refresh-token.model');
const { signAccess, signRefresh, verifyRefresh } = require('../../shared/jwt');

const COOKIE_NAME = 'refreshToken'; // httpOnly cookie

// helpers
function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/api/auth/refresh', // кука будет слаться только сюда
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

async function createRefresh(userId, ua, ip) {
  const jti = crypto.randomUUID();
  const token = signRefresh({ sub: userId, jti });

  await RefreshToken.create({
    userId,
    jti,
    userAgent: ua,
    ip,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      req.ip
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
      req.ip
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

router.post('/refresh', async (req, res, next) => {
  try {
    const cookie = req.cookies?.refreshToken;
    if (!cookie) return res.status(401).json({ message: 'No refresh cookie' });

    // верифицируем
    let payload;
    try {
      payload = verifyRefresh(cookie);
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // найдём в БД и проверим не отозван ли
    const stored = await RefreshToken.findOne({
      jti: payload.jti,
      userId: payload.sub,
      revokedAt: null,
    });
    if (!stored) return res.status(401).json({ message: 'Refresh not found' });

    // ротация: старый инвалидируем
    stored.revokedAt = new Date();
    await stored.save();

    // создаём новый refresh
    const refreshToken = await createRefresh(
      payload.sub,
      req.headers['user-agent'] || '',
      req.ip
    );
    setRefreshCookie(res, refreshToken);

    const user = await User.findById(payload.sub);
    const accessToken = signAccess({
      sub: user._id.toString(),
      roles: user.roles,
    });
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

router.post('/logout', async (req, res, next) => {
  try {
    const cookie = req.cookies?.refreshToken;
    if (cookie) {
      try {
        const payload = verifyRefresh(cookie);

        // Удаляем все токены текущего пользователя
        await RefreshToken.deleteMany({ userId: payload.sub });
      } catch (err) {
        console.error('Logout cleanup error:', err.message);
      }
    }
    res.clearCookie(COOKIE_NAME, { path: '/api/auth' }); // чтобы cookie отправлялась и на /auth/logout
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
