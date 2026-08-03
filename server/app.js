const crypto = require('crypto');
const express = require('express');
const cors = require('cors');

const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const membershipRoutes = require('./routes/memberships');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const workoutPlanRoutes = require('./routes/workoutPlans');
const dietPlanRoutes = require('./routes/dietPlans');
const enquiryRoutes = require('./routes/enquiries');

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fitledger.vercel.app',
];

const getAllowedOrigins = () => [
  ...DEFAULT_ORIGINS,
  ...(process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()),
].filter(Boolean);

const requestContext = (req, res, next) => {
  const incomingRequestId = req.header('x-request-id');
  req.requestId = incomingRequestId && incomingRequestId.length <= 128
    ? incomingRequestId
    : crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
};

const securityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

const requestLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.log(JSON.stringify({
      level: 'info',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    }));
  });
  next();
};

const mountApiRoutes = (app, prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/members`, memberRoutes);
  app.use(`${prefix}/memberships`, membershipRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
  app.use(`${prefix}/workout-plans`, workoutPlanRoutes);
  app.use(`${prefix}/diet-plans`, dietPlanRoutes);
  app.use(`${prefix}/enquiries`, enquiryRoutes);
};

const createApp = () => {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(securityHeaders);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed by CORS');
      error.statusCode = 403;
      error.code = 'CORS_ORIGIN_DENIED';
      return callback(error);
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  if (process.env.NODE_ENV !== 'test') app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  mountApiRoutes(app, '/api');
  mountApiRoutes(app, '/api/v1');

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = {
  createApp,
  getAllowedOrigins,
  requestContext,
  securityHeaders,
};
