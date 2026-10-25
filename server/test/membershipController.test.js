const test = require('node:test');
const assert = require('node:assert/strict');

const { buildMembershipPayload } = require('../controllers/membershipController');

test('membership payload defaults original price to final price', () => {
  const result = buildMembershipPayload({ name: 'Starter', price: 299, duration: 1 });
  assert.deepEqual(result.data, {
    name: 'Starter',
    price: 299,
    originalPrice: 299,
    duration: 1,
    ptIncluded: false,
  });
});

test('membership payload rejects an original price below the final price', () => {
  const result = buildMembershipPayload({ name: 'Starter', price: 799, originalPrice: 299, duration: 1 });
  assert.equal(result.error, 'Original price must be greater than or equal to the final price');
});
