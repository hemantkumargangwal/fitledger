const crypto = require('crypto');
const { AppError } = require('../utils/errorHandler');

const buckets = new Map();

const hashKey = (value) => crypto.createHash('sha256').update(value).digest('hex');

const createRateLimit = ({ windowMs, max, key = (req) => req.ip || 'unknown' }) => (
  req,
  res,
  next
) => {
  const now = Date.now();
  const bucketKey = hashKey(String(key(req)).toLowerCase());
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (current.count >= max) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    return next(new AppError(
      'Too many attempts. Please try again later.',
      429,
      'RATE_LIMITED'
    ));
  }

  current.count += 1;
  return next();
};

const resetRateLimitsForTests = () => buckets.clear();

module.exports = { createRateLimit, resetRateLimitsForTests };
