const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
const { createApp, requestContext, securityHeaders } = require('../app');
const { AppError, errorHandler, notFoundHandler } = require('../utils/errorHandler');
const { ownerOnly } = require('../middleware/authorize');

const createResponse = () => {
  const headers = new Map();
  return {
    statusCode: 200,
    body: null,
    headersSent: false,
    setHeader: (key, value) => headers.set(key.toLowerCase(), value),
    getHeader: (key) => headers.get(key.toLowerCase()),
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
};

test('request context accepts a bounded incoming request id', () => {
  const req = { header: () => 'foundation-test' };
  const res = createResponse();
  let nextCalled = false;

  requestContext(req, res, () => { nextCalled = true; });

  assert.equal(req.requestId, 'foundation-test');
  assert.equal(res.getHeader('x-request-id'), 'foundation-test');
  assert.equal(nextCalled, true);
});

test('security middleware sets baseline browser protections', () => {
  const res = createResponse();
  securityHeaders({}, res, () => {});

  assert.equal(res.getHeader('x-content-type-options'), 'nosniff');
  assert.equal(res.getHeader('x-frame-options'), 'DENY');
  assert.match(res.getHeader('permissions-policy'), /camera=\(\)/);
});

test('unknown routes use the standard error contract', () => {
  const req = {
    method: 'GET',
    originalUrl: '/does-not-exist',
    requestId: 'not-found-test',
  };
  const res = createResponse();
  let routeError;

  notFoundHandler(req, res, (error) => { routeError = error; });
  errorHandler(routeError, req, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'ROUTE_NOT_FOUND');
  assert.equal(res.body.requestId, 'not-found-test');
});

test('application errors preserve public codes and field errors', () => {
  const req = { requestId: 'validation-test' };
  const res = createResponse();
  const error = new AppError('Request validation failed', 400, 'VALIDATION_ERROR', [
    { field: 'name', message: 'Name is required' },
  ]);

  errorHandler(error, req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  assert.equal(res.body.error.fields[0].field, 'name');
});

test('v1 API routes are mounted alongside legacy routes', () => {
  const app = createApp();
  const routePatterns = app._router.stack
    .filter((layer) => layer.name === 'router')
    .map((layer) => layer.regexp.toString());

  assert.ok(routePatterns.some((pattern) => pattern.includes('api\\/v1\\/dashboard')));
  assert.ok(routePatterns.some((pattern) => pattern.includes('api\\/dashboard')));
});

test('owner-only authorization allows owners', () => {
  let nextValue = 'not-called';
  ownerOnly({ user: { role: 'owner' } }, {}, (value) => { nextValue = value; });
  assert.equal(nextValue, undefined);
});

test('owner-only authorization rejects other roles', () => {
  let nextError;
  ownerOnly({ user: { role: 'staff' } }, {}, (error) => { nextError = error; });
  assert.equal(nextError.statusCode, 403);
  assert.equal(nextError.code, 'FORBIDDEN');
});
