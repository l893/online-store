const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { port, mongoUri } = require('./config/env');

const app = express();
app.set('trust proxy', 1);

// middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// CORS в dev (при раздельных доменах/портках)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}

// rate-limit для auth (подключим позже к /auth/*)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

// базовый healthcheck (для докера/оркестратора)
app.get('/api/health', (req, res) => res.json({ ok: true }));

// подключаем роуты
app.use('/api/products', require('./modules/products/product.routes'));
app.use('/api/categories', require('./modules/categories/category.routes'));

// 404
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// errors
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Server error' });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => console.log(`API listening on ${port}`));
  })
  .catch((e) => {
    console.error('Mongo connect error', e);
    process.exit(1);
  });
