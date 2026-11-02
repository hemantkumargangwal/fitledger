const EmailLog = require('../models/EmailLog');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const { sendMsg91TemplateEmail } = require('./emailService');

const EMAIL_EVENTS = Object.freeze({
  ENQUIRY: 'ENQUIRY',
  ENQUIRY_FOLLOWUP: 'ENQUIRY_FOLLOWUP',
  WELCOME: 'WELCOME',
  EXPIRY_7_DAYS: 'EXPIRY_7_DAYS',
  EXPIRY_3_DAYS: 'EXPIRY_3_DAYS',
  EXPIRY_TODAY: 'EXPIRY_TODAY',
  PAYMENT_RECEIPT: 'PAYMENT_RECEIPT',
  MEMBERSHIP_RENEWED: 'MEMBERSHIP_RENEWED',
});

const templateFor = (eventType) => process.env[`MSG91_TEMPLATE_${eventType}`] || '';
const text = (value) => String(value || '').trim();
const money = (value) => Number(value || 0).toFixed(2);
const date = (value, timeZone = process.env.EMAIL_TIMEZONE || 'Asia/Kolkata') => value ? new Intl.DateTimeFormat('en-IN', { timeZone, day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '';
const membershipPeriodKey = (member) => member?.membershipAssignment?.assignedAt ? new Date(member.membershipAssignment.assignedAt).toISOString() : '';

const buildVariables = ({ gym, member, enquiry, payment, balanceDue }) => ({
  gym_name: text(gym?.gymName),
  gym_logo_url: text(gym?.logoUrl),
  gym_website: text(gym?.website),
  gym_address: text(gym?.address),
  gym_phone: text(gym?.phone),
  gym_email: text(gym?.email),
  gym_email_signature: text(gym?.emailSignature),
  member_name: text(member?.name || enquiry?.name),
  member_id: text(member?.memberCode),
  membership_name: text(member?.membershipAssignment?.membershipName || member?.membershipAssignment?.plan),
  start_date: date(member?.membershipAssignment?.startDate, gym?.timezone),
  expiry_date: date(member?.membershipAssignment?.endDate || member?.expiryDate, gym?.timezone),
  membership_fee: money(member?.membershipAssignment?.totalAmountPayable || member?.membershipAssignment?.membershipPrice),
  amount_paid: money(payment?.amount),
  balance_due: money(balanceDue),
  enquiry_source: text(enquiry?.source),
  assigned_to: text(enquiry?.assignedTo),
});

const isAmbiguousProviderError = (error) => /timed out|timeout|econn|socket hang up|network/i.test(error.message || '');
const calendarParts = (value) => Object.fromEntries(new Intl.DateTimeFormat('en-US', {
  timeZone: process.env.EMAIL_TIMEZONE || 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
}).formatToParts(value).filter((part) => ['year', 'month', 'day'].includes(part.type)).map((part) => [part.type, Number(part.value)]));

const createAttempt = async ({ eventType, gym, recipient, member, enquiry, payment, balanceDue, dedupeKey }) => {
  const templateId = templateFor(eventType);
  if (!templateId) throw new Error(`MSG91 template for ${eventType} is not configured.`);
  if (!recipient?.email) return { skipped: true, reason: 'recipient_email_missing' };
  const logData = {
    gymId: gym._id,
    memberId: member?._id,
    enquiryId: enquiry?._id,
    paymentId: payment?._id,
    eventType,
    membershipPeriodKey: membershipPeriodKey(member),
    recipientEmail: recipient.email,
    templateId,
    variables: buildVariables({ gym, member, enquiry, payment, balanceDue }),
    dedupeKey,
  };
  try {
    return { log: await EmailLog.create(logData), created: true };
  } catch (error) {
    if (error.code !== 11000) throw error;
    return { log: await EmailLog.findOne({ dedupeKey }), created: false };
  }
};

const deliverEmailLog = async (log) => {
  if (!log || !['pending', 'failed'].includes(log.status) || log.attempts >= 3) return log;
  log.attempts += 1;
  await log.save();
  try {
    const result = await sendMsg91TemplateEmail({
      toEmail: log.recipientEmail,
      recipientName: log.variables.member_name || log.recipientEmail,
      companyName: log.variables.gym_name,
      templateId: log.templateId,
      variables: log.variables,
    });
    if (!result.delivered) throw new Error(result.reason || 'MSG91 did not accept the email.');
    log.status = 'sent';
    log.sentAt = new Date();
    log.providerResponse = result.providerResponse;
    log.providerMessageId = text(result.providerResponse?.request_id || result.providerResponse?.message_id);
    log.lastError = undefined;
  } catch (error) {
    log.status = isAmbiguousProviderError(error) ? 'unknown' : 'failed';
    log.lastError = text(error.message).slice(0, 500);
  }
  await log.save();
  return log;
};

const queueEmailEvent = async (context) => {
  const attempt = await createAttempt(context);
  if (attempt.skipped || !attempt.created) return attempt;
  setImmediate(() => deliverEmailLog(attempt.log).catch((error) => console.error('Email delivery worker error:', error.message)));
  return attempt;
};

const sendEmailEventNow = async (context) => {
  const attempt = await createAttempt(context);
  if (attempt.skipped) return attempt;
  if (!attempt.created) return { ...attempt, duplicate: true };
  return { ...attempt, log: await deliverEmailLog(attempt.log) };
};

const retryFailedEmailLogs = async () => {
  const logs = await EmailLog.find({ status: 'failed', attempts: { $lt: 3 } }).sort({ updatedAt: 1 }).limit(100);
  await Promise.all(logs.map((log) => deliverEmailLog(log)));
  return logs.length;
};

const runExpiryReminderJob = async (now = new Date()) => {
  const eventOffsets = [[7, EMAIL_EVENTS.EXPIRY_7_DAYS], [3, EMAIL_EVENTS.EXPIRY_3_DAYS], [0, EMAIL_EVENTS.EXPIRY_TODAY]];
  const gymCache = new Map();
  let queued = 0;
  const today = calendarParts(now);
  for (const [offset, eventType] of eventOffsets) {
    const target = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    const next = new Date(target); next.setUTCDate(next.getUTCDate() + 1);
    const members = await Member.find({ gymId: { $exists: true }, status: 'active', expiryDate: { $gte: target, $lt: next } }).lean();
    for (const member of members) {
      const gymKey = String(member.gymId);
      let gym = gymCache.get(gymKey);
      if (!gym) { gym = await Gym.findById(member.gymId).lean(); gymCache.set(gymKey, gym); }
      if (!gym || !member.email || !member.membershipAssignment?.endDate) continue;
      const period = membershipPeriodKey(member);
      try {
        const result = await queueEmailEvent({ eventType, gym, member, recipient: member, dedupeKey: `${eventType}:${member._id}:${period}` });
        if (result.created) queued += 1;
      } catch (error) {
        console.error('Queue expiry reminder email error:', error.message);
      }
    }
  }
  await retryFailedEmailLogs();
  return queued;
};

const startExpiryReminderScheduler = () => {
  const run = () => runExpiryReminderJob().catch((error) => console.error('Expiry reminder job failed:', error.message));
  run();
  return setInterval(run, 6 * 60 * 60 * 1000);
};

module.exports = { EMAIL_EVENTS, buildVariables, membershipPeriodKey, queueEmailEvent, sendEmailEventNow, deliverEmailLog, runExpiryReminderJob, startExpiryReminderScheduler };
