const test = require('node:test');
const assert = require('node:assert/strict');
const { assignmentKey, createToken, hashToken, publicUrl } = require('../services/planShareService');
const PlanShareLink = require('../models/PlanShareLink');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const { getPublicSharedPlan } = require('../controllers/planShareController');

const response = () => {
  const headers = new Map();
  return {
    body: null,
    setHeader: (name, value) => headers.set(name.toLowerCase(), value),
    getHeader: (name) => headers.get(name.toLowerCase()),
    json(body) { this.body = body; return this; },
  };
};

const selectResult = (value) => ({ select: async () => value });
const leanResult = (value) => ({ select: () => ({ lean: async () => value }) });

test('plan sharing tokens are random, hashable, and never embedded in the stored hash', () => {
  const first = createToken();
  const second = createToken();
  assert.notEqual(first, second);
  assert.equal(hashToken(first).length, 64);
  assert.equal(hashToken(first).includes(first), false);
});

test('public plan URL encodes the supplied token', () => {
  const url = publicUrl('token with / reserved characters');
  assert.match(url, /shared-plan\/token%20with%20%2F%20reserved%20characters$/);
});

test('same assignment content has a stable key across retry timestamps', () => {
  const base = { membershipId: 'membership-1', membershipName: 'Pro', startDate: '2026-01-01', endDate: '2026-02-01', plan: 'Strength', diet: 'Lean', trainer: 'Coach' };
  assert.equal(
    assignmentKey({ membershipAssignment: { ...base, assignedAt: '2026-01-01T10:00:00.000Z' } }),
    assignmentKey({ membershipAssignment: { ...base, assignedAt: '2026-01-01T10:01:00.000Z' } })
  );
});

test('public shared-plan API returns only its snapshot and minimal public identity', async () => {
  const token = 'secure-token';
  const share = {
    tokenHash: hashToken(token), isActive: true, expiresAt: new Date(Date.now() + 60_000),
    gymId: 'gym-1', memberId: 'member-1',
    workoutPlan: { name: 'Strength', tableRows: [{ day: 'Mon', exercise: 'Squat', sets: '3', reps: '10', rest: '60 sec' }] },
    dietPlan: { name: 'Lean diet', tableRows: [{ time: '08:00', meal: 'Breakfast', food: 'Oats', quantity: '1 bowl' }] },
  };
  const original = { findOne: PlanShareLink.findOne, gym: Gym.findById, member: Member.findOne };
  PlanShareLink.findOne = () => selectResult(share);
  Gym.findById = () => leanResult({ gymName: 'Fit Gym', logoUrl: 'https://example.test/logo.png', email: 'private@example.test' });
  Member.findOne = () => leanResult({ name: 'Asha Patel', email: 'asha@example.test', phone: '9999999999' });
  try {
    const res = response();
    await getPublicSharedPlan({ params: { shareToken: token } }, res);
    assert.deepEqual(res.body, {
      gym: { name: 'Fit Gym', logoUrl: 'https://example.test/logo.png' },
      member: { firstName: 'Asha' },
      workoutPlan: share.workoutPlan, dietPlan: share.dietPlan, expiresAt: share.expiresAt,
    });
    assert.equal(res.getHeader('cache-control'), 'private, no-store, max-age=0');
    assert.match(res.getHeader('x-robots-tag'), /noindex/);
  } finally {
    PlanShareLink.findOne = original.findOne; Gym.findById = original.gym; Member.findOne = original.member;
  }
});

test('public shared-plan API rejects invalid, expired, revoked, and cross-gym records', async () => {
  const token = 'secure-token';
  const original = { findOne: PlanShareLink.findOne, gym: Gym.findById, member: Member.findOne };
  const expectCode = async (share, member, code) => {
    PlanShareLink.findOne = () => selectResult(share);
    Gym.findById = () => leanResult({ gymName: 'Fit Gym' });
    Member.findOne = () => leanResult(member);
    await assert.rejects(() => getPublicSharedPlan({ params: { shareToken: token } }, response()), (error) => error.code === code);
  };
  try {
    await expectCode(null, null, 'LINK_INVALID');
    await expectCode({ tokenHash: hashToken(token), isActive: false, expiresAt: new Date(Date.now() + 60_000) }, null, 'LINK_REVOKED');
    await expectCode({ tokenHash: hashToken(token), isActive: true, expiresAt: new Date(Date.now() - 60_000) }, null, 'LINK_EXPIRED');
    await expectCode({ tokenHash: hashToken(token), isActive: true, expiresAt: new Date(Date.now() + 60_000), gymId: 'gym-1', memberId: 'member-1' }, null, 'LINK_INVALID');
  } finally {
    PlanShareLink.findOne = original.findOne; Gym.findById = original.gym; Member.findOne = original.member;
  }
});

test('public payload supports workout-only and diet-only snapshots', () => {
  const { publicSharePayload } = require('../services/planShareService');
  const base = { gymName: 'Fit Gym' };
  const member = { name: 'Ravi' };
  assert.equal(publicSharePayload({ workoutPlan: { name: 'Workout' }, dietPlan: null }, base, member).dietPlan, null);
  assert.equal(publicSharePayload({ workoutPlan: null, dietPlan: { name: 'Diet' } }, base, member).workoutPlan, null);
});
