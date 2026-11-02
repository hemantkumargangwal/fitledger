const crypto = require('crypto');
const PlanShareLink = require('../models/PlanShareLink');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');
const { sendMsg91TemplateEmail } = require('./emailService');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createToken = () => crypto.randomBytes(32).toString('base64url');
const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'Member';
// Deliberately excludes assignedAt: retries of the same assignment receive a
// fresh timestamp but must reuse the existing public link and email record.
const assignmentKey = (member) => {
  const assignment = member.membershipAssignment;
  if (!assignment?.plan && !assignment?.diet) return '';
  return crypto.createHash('sha256').update(JSON.stringify({
    membershipId: String(assignment.membershipId || ''),
    membershipName: assignment.membershipName || '',
    startDate: assignment.startDate ? new Date(assignment.startDate).toISOString() : '',
    endDate: assignment.endDate ? new Date(assignment.endDate).toISOString() : '',
    plan: assignment.plan || '',
    diet: assignment.diet || '',
    trainer: assignment.trainer || '',
  })).digest('hex');
};
const snapshot = (plan, kind) => !plan ? undefined : ({
  name: plan.name,
  description: plan.description || '',
  note: plan.note || '',
  details: plan.details || '',
  category: plan.category || '',
  difficulty: plan.difficulty || '',
  dietPreference: plan.dietPreference || '',
  tableRows: plan.tableRows || [],
  kind,
});

const publicUrl = (token) => `${String(process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].replace(/\/$/, '')}/shared-plan/${encodeURIComponent(token)}`;

const createOrReusePlanShare = async ({ gymId, member, expiresInDays = Number(process.env.PLAN_SHARE_EXPIRY_DAYS || 30) }) => {
  const assignment = member.membershipAssignment;
  const currentKey = assignmentKey(member);
  if (!currentKey || (!assignment?.plan && !assignment?.diet)) return null;
  const [workoutPlan, dietPlan] = await Promise.all([
    assignment.plan ? WorkoutPlan.findOne({ gymId, name: assignment.plan }).lean() : null,
    assignment.diet ? DietPlan.findOne({ gymId, name: assignment.diet }).lean() : null,
  ]);
  if (!workoutPlan && !dietPlan) return null;
  // Snapshot content is part of the fingerprint. Updating a source plan and
  // assigning it again produces a new, deliberate public version.
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify({ currentKey, workout: snapshot(workoutPlan, 'workout'), diet: snapshot(dietPlan, 'diet') })).digest('hex');
  const existing = await PlanShareLink.findOne({ gymId, memberId: member._id, assignmentFingerprint: fingerprint, isActive: true, expiresAt: { $gt: new Date() } });
  if (existing) return { share: existing, created: false };

  await PlanShareLink.updateMany(
    { gymId, memberId: member._id, isActive: true, assignmentFingerprint: { $ne: fingerprint } },
    { $set: { isActive: false } }
  );
  const token = createToken();
  const expiresAt = new Date(Date.now() + Math.max(1, Math.min(Number(expiresInDays) || 30, 365)) * 24 * 60 * 60 * 1000);
  try {
    const share = await PlanShareLink.create({
      gymId,
      memberId: member._id,
      assignmentIds: { assignmentKey: currentKey, workoutPlanId: workoutPlan?._id, dietPlanId: dietPlan?._id },
      assignmentFingerprint: fingerprint,
      tokenHash: hashToken(token),
      workoutPlan: snapshot(workoutPlan, 'workout'),
      dietPlan: snapshot(dietPlan, 'diet'),
      expiresAt,
    });
    return { share, token, url: publicUrl(token), created: true };
  } catch (error) {
    if (error.code !== 11000) throw error;
    return { share: await PlanShareLink.findOne({ gymId, memberId: member._id, assignmentFingerprint: fingerprint, isActive: true }), created: false };
  }
};

const revokePlanShares = (gymId, memberId) => PlanShareLink.updateMany({ gymId, memberId, isActive: true }, { $set: { isActive: false } });

const sendPlanShareEmail = async ({ share, url, gym, member }) => {
  if (!share || !url || !member.email || share.emailStatus === 'sent') return share;
  share.emailAttempts += 1;
  await share.save();
  try {
    if (!process.env.MSG91_TEMPLATE_FITNESS_PLAN_SHARE) throw new Error('Fitness plan share email template is not configured.');
    await sendMsg91TemplateEmail({
      toEmail: member.email,
      recipientName: firstName(member.name),
      companyName: gym.gymName,
      templateId: process.env.MSG91_TEMPLATE_FITNESS_PLAN_SHARE,
      variables: {
        gym_name: gym.gymName || '', member_name: firstName(member.name),
        workout_plan_name: share.workoutPlan?.name || '', diet_plan_name: share.dietPlan?.name || '',
        share_url: url, gym_phone: gym.phone || '', gym_email: gym.email || '',
      },
    });
    share.emailStatus = 'sent'; share.emailSentAt = new Date(); share.emailError = undefined;
  } catch (error) {
    share.emailStatus = /timeout|econn|network/i.test(error.message || '') ? 'unknown' : 'failed';
    share.emailError = String(error.message || 'Email could not be sent').slice(0, 500);
  }
  await share.save();
  return share;
};

const publicSharePayload = (share, gym, member) => ({
  gym: { name: gym.gymName || 'FitSaarthi', logoUrl: gym.logoUrl || '' },
  member: { firstName: firstName(member.name) },
  workoutPlan: share.workoutPlan || null,
  dietPlan: share.dietPlan || null,
  expiresAt: share.expiresAt,
});

module.exports = { hashToken, createToken, assignmentKey, createOrReusePlanShare, revokePlanShares, sendPlanShareEmail, publicSharePayload, publicUrl };
