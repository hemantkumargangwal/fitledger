const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePagination } = require('../utils/validators');

test('pagination applies safe defaults', () => {
  assert.deepEqual(validatePagination({}, ['createdAt']), {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
});

test('pagination rejects excessive limits', () => {
  assert.throws(() => validatePagination({ limit: '101' }), /between 1 and 100/);
});

test('pagination rejects non-whitelisted sort fields', () => {
  assert.throws(
    () => validatePagination({ sortBy: 'password' }, ['name', 'createdAt']),
    /Sort field must be one of/
  );
});
