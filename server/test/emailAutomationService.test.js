const test = require('node:test');
const assert = require('node:assert/strict');

process.env.EMAIL_TIMEZONE = 'Asia/Kolkata';
const { buildVariables, membershipPeriodKey } = require('../services/emailAutomationService');

test('email variables are built only from the supplied gym and member records', () => {
  const variables = buildVariables({
    gym: { gymName: 'Gym One', email: 'owner@gym-one.example', phone: '9000000001', address: 'One Street' },
    member: {
      name: 'Member One', memberCode: 'one-1',
      membershipAssignment: { membershipName: 'Gold', startDate: '2026-10-01', endDate: '2026-10-31', totalAmountPayable: 2500 },
    },
    payment: { amount: 1000 },
    balanceDue: 1500,
  });

  assert.equal(variables.gym_name, 'Gym One');
  assert.equal(variables.gym_email, 'owner@gym-one.example');
  assert.equal(variables.member_name, 'Member One');
  assert.equal(variables.membership_name, 'Gold');
  assert.equal(variables.amount_paid, '1000.00');
  assert.equal(variables.balance_due, '1500.00');
});

test('membership period key changes with each assigned membership period', () => {
  const first = membershipPeriodKey({ membershipAssignment: { assignedAt: '2026-10-01T00:00:00.000Z' } });
  const renewed = membershipPeriodKey({ membershipAssignment: { assignedAt: '2026-11-01T00:00:00.000Z' } });

  assert.notEqual(first, renewed);
  assert.equal(membershipPeriodKey({}), '');
});
