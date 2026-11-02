const crypto = require('crypto');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const PlanShareLink = require('../models/PlanShareLink');
const { AppError } = require('../utils/errorHandler');
const { createOrReusePlanShare, hashToken, publicSharePayload, revokePlanShares, sendPlanShareEmail } = require('../services/planShareService');

const safeTokenHash = (token) => crypto.createHash('sha256').update(String(token || '')).digest('hex');

const getPublicSharedPlan = async (req, res) => {
  const tokenHash = safeTokenHash(req.params.shareToken);
  const share = await PlanShareLink.findOne({ tokenHash }).select('+tokenHash');
  if (!share) throw new AppError('This shared plan link is invalid.', 404, 'LINK_INVALID');
  if (!crypto.timingSafeEqual(Buffer.from(share.tokenHash, 'hex'), Buffer.from(tokenHash, 'hex'))) throw new AppError('This shared plan link is invalid.', 404, 'LINK_INVALID');
  if (!share.isActive) throw new AppError('This shared plan link has been revoked.', 410, 'LINK_REVOKED');
  if (share.expiresAt <= new Date()) throw new AppError('This shared plan link has expired.', 410, 'LINK_EXPIRED');
  const [gym, member] = await Promise.all([
    Gym.findById(share.gymId).select('gymName logoUrl').lean(),
    Member.findOne({ _id: share.memberId, gymId: share.gymId }).select('name').lean(),
  ]);
  if (!gym || !member) throw new AppError('This shared plan link is no longer available.', 404, 'LINK_INVALID');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res.json(publicSharePayload(share, gym, member));
};

const getMemberPlanShare = async (req, res) => {
  const share = await PlanShareLink.findOne({ gymId: req.gymId, memberId: req.params.id, isActive: true }).sort({ createdAt: -1 }).select('-tokenHash').lean();
  return res.json({ share: share ? { isActive: share.isActive, expiresAt: share.expiresAt, workoutPlanName: share.workoutPlan?.name || '', dietPlanName: share.dietPlan?.name || '', emailStatus: share.emailStatus } : null });
};

const regenerateMemberPlanShare = async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw new AppError('Member not found', 404, 'RESOURCE_NOT_FOUND');
  await revokePlanShares(req.gymId, member._id);
  const result = await createOrReusePlanShare({ gymId: req.gymId, member, expiresInDays: req.body.expiresInDays });
  if (!result?.share || !result.url) throw new AppError('Assign at least one saved workout or diet plan first.', 422, 'PLAN_ASSIGNMENT_REQUIRED');
  const gym = await Gym.findById(req.gymId).lean();
  sendPlanShareEmail({ share: result.share, url: result.url, gym, member }).catch((error) => console.error('Plan share email error:', error.message));
  return res.status(201).json({ message: 'New sharing link created', share: { url: result.url, expiresAt: result.share.expiresAt } });
};

const revokeMemberPlanShare = async (req, res) => {
  const member = await Member.exists({ _id: req.params.id, gymId: req.gymId });
  if (!member) throw new AppError('Member not found', 404, 'RESOURCE_NOT_FOUND');
  await revokePlanShares(req.gymId, req.params.id);
  return res.json({ message: 'Sharing link revoked' });
};

module.exports = { getPublicSharedPlan, getMemberPlanShare, regenerateMemberPlanShare, revokeMemberPlanShare };
