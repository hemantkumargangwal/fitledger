const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhone, payloadFromRecord, reviewRows, suggestMappings } = require('../services/memberImportService');

test('member import maps common alternate headers and keeps unsupported columns unmapped', () => {
  const mappings = suggestMappings(['Full Name', 'WhatsApp Number', 'E-mail Address', 'Source system']);
  assert.deepEqual(mappings, { 'Full Name': 'name', 'WhatsApp Number': 'phone', 'E-mail Address': 'email', 'Source system': '' });
});

test('member import validates only name and normalized mobile as required fields', async () => {
  const review = await reviewRows({
    rows: [{ rowNumber: 2, values: { Name: 'Asha', Mobile: '+91 98765 43210', City: 'Pune' } }, { rowNumber: 3, values: { Name: '', Mobile: '99999' } }],
    mappings: { Name: 'name', Mobile: 'phone', City: '' }, existingMembers: [],
  });
  assert.equal(normalizePhone('+91 98765 43210'), '9876543210');
  assert.equal(review.summary.validRows, 1);
  assert.match(review.rows[1].errors.join(' '), /Member name is required/);
});

test('member import marks existing and in-file mobile duplicates without overwriting them', async () => {
  const review = await reviewRows({
    rows: [{ rowNumber: 2, values: { Name: 'Asha', Mobile: '9876543210' } }, { rowNumber: 3, values: { Name: 'Asha again', Mobile: '9876543210' } }],
    mappings: { Name: 'name', Mobile: 'phone' }, existingMembers: [{ _id: 'member-1', name: 'Existing Asha', phone: '+91 9876543210' }],
  });
  assert.equal(review.rows[0].duplicate.type, 'existing');
  assert.equal(review.rows[1].duplicate.type, 'existing');
});

test('member import creates a partial inactive payload without membership or payment data', () => {
  const payload = payloadFromRecord({ phone: '9876543210', values: { name: 'Ravi', phone: '9876543210', email: 'ravi@example.test', 'bodyStats.height': '178' } });
  assert.deepEqual(payload, { name: 'Ravi', phone: '9876543210', email: 'ravi@example.test', bodyStats: { height: '178' } });
  assert.equal('membershipAssignment' in payload, false);
});
