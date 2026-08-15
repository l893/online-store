import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { mongoUri, port } from './config/env.js';
import authRouter from './modules/auth/auth.routes.js';
import cartRouter from './modules/cart/cart.routes.js';
import categoryRouter from './modules/categories/category.routes.js';
import orderRouter from './modules/orders/order.routes.js';
import adminProductsRouter from './modules/products/admin.routes.js';
import productRouter from './modules/products/product.routes.js';

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

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

app.use(generalApiLimiter);

// базовый healthcheck (для докера/оркестратора)
app.get('/api/health', (req, res) => res.json({ ok: true }));

// подключаем роуты
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    message: 'Too many login attempts, try again later',
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many registration attempts, try again later',
  },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    message: 'Too many refresh attempts, try again later',
  },
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/refresh', refreshLimiter);
app.use('/api/auth', authRouter);

app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

app.use('/api/admin/products', adminProductsRouter);

// 404
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// errors
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getApplicationErrorStatusCode(error: unknown): number {
  if (!isRecord(error)) {
    return 500;
  }

  const errorStatus = Number(error.status);

  return Number.isInteger(errorStatus) &&
    errorStatus >= 400 &&
    errorStatus <= 599
    ? errorStatus
    : 500;
}

function getApplicationErrorMessage(error: unknown): string {
  if (isRecord(error) && typeof error.message === 'string' && error.message) {
    return error.message;
  }

  return 'Request failed';
}

function handleApplicationError(
  error: unknown,
  request: Request,
  response: Response,
  nextMiddleware: NextFunction,
): void {
  console.error(error);

  const statusCode = getApplicationErrorStatusCode(error);
  const isServerError = statusCode >= 500;

  response.status(statusCode).json({
    message: isServerError ? 'Server error' : getApplicationErrorMessage(error),
  });
}

app.use(handleApplicationError);

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => console.log(`API listening on ${port}`));
  })
  .catch((error: unknown) => {
    console.error('Mongo connect error', error);
    process.exit(1);
  });
