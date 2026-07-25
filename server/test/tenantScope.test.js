const test = require('node:test');
const assert = require('node:assert/strict');

const { tenantCreateData, tenantFilter } = require('../utils/tenantScope');

test('tenantFilter always uses the authenticated tenant', () => {
  const result = tenantFilter('trusted-gym', { gymId: 'untrusted-gym', status: 'active' });
  assert.deepEqual(result, { gymId: 'trusted-gym', status: 'active' });
});

test('tenantCreateData always uses the authenticated tenant', () => {
  const result = tenantCreateData('trusted-gym', { gymId: 'untrusted-gym', name: 'Member' });
  assert.deepEqual(result, { gymId: 'trusted-gym', name: 'Member' });
});

test('tenant helpers reject missing tenant context', () => {
  assert.throws(
    () => tenantFilter(null, { status: 'active' }),
    (error) => error.code === 'TENANT_CONTEXT_MISSING'
  );
});
