const Member = require('../models/Member');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Gym = require('../models/Gym');
const EmailLog = require('../models/EmailLog');
const { createLog } = require('../services/activityService');
const jwt = require('jsonwebtoken');
const { sendEnrollmentInvitationEmail } = require('../services/emailService');
const { sendMemberMessage } = require('../services/memberMessagingService');
const { EMAIL_EVENTS, membershipPeriodKey, queueEmailEvent } = require('../services/emailAutomationService');
const { createOrReusePlanShare, revokePlanShares, sendPlanShareEmail } = require('../services/planShareService');
const { cleanMappings, createSession, getSession, payloadFromRecord, reviewRows } = require('../services/memberImportService');

const parseDate = (value) => (value ? new Date(value) : undefined);
const cleanString = (value) => String(value || '').trim();
const cleanNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getMemberPayload = (body) => ({
  name: cleanString(body.name || body.fullName),
  phone: cleanString(body.phone || body.mobile),
  gender: cleanString(body.gender),
  email: cleanString(body.email).toLowerCase(),
  dateOfBirth: parseDate(body.dateOfBirth),
  anniversaryDate: parseDate(body.anniversaryDate),
  address: cleanString(body.address),
  emergencyContactNumber: cleanString(body.emergencyContactNumber),
  photo: cleanString(body.photo),
  joiningDate: parseDate(body.joiningDate) || new Date(),
  documentId: cleanString(body.documentId),
  bodyStats: {
    height: cleanString(body.bodyStats?.height),
    weight: cleanString(body.bodyStats?.weight),
    bmi: cleanString(body.bodyStats?.bmi),
    bodyFat: cleanString(body.bodyStats?.bodyFat),
    shoulder: cleanString(body.bodyStats?.shoulder),
    chest: cleanString(body.bodyStats?.chest),
    hips: cleanString(body.bodyStats?.hips),
    abs: cleanString(body.bodyStats?.abs),
    waistHip: cleanString(body.bodyStats?.waistHip),
    bloodMeasurementDate: parseDate(body.bodyStats?.bloodMeasurementDate)
  }
});

const buildMemberCode = async (gymId) => {
  const gym = await Gym.findById(gymId).select('gymName').lean();
  const prefix = cleanString(gym?.gymName)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toLowerCase() || 'fit';
  const count = await Member.countDocuments({ gymId });
  return `${prefix}${count + 1}`;
};

const importReviewResponse = async (session, gymId, mappings) => {
  const safeMappings = cleanMappings(session.headers, mappings || session.mappings);
  const existingMembers = await Member.find({ gymId }).select('name phone').lean();
  const review = await reviewRows({ rows: session.rows, mappings: safeMappings, existingMembers });
  return {
    importId: session.importId,
    expiresAt: new Date(session.expiresAt).toISOString(),
    headers: session.headers,
    mappedFields: safeMappings,
    supportedFields: require('../services/memberImportService').supportedFields,
    ignoredColumns: session.headers.filter((header) => !safeMappings[header]),
    summary: review.summary,
    rows: review.rows.map((row) => ({ rowNumber: row.rowNumber, name: row.values.name || '', phone: row.values.phone || '', errors: row.errors, duplicate: row.duplicate || null })),
  };
};

const previewMemberImport = async (req, res) => {
  const session = createSession({ gymId: req.gymId, userId: req.user._id, file: req.file });
  const preview = await importReviewResponse(session, req.gymId, session.mappings);
  res.status(201).json(preview);
};

const reviewMemberImport = async (req, res) => {
  const session = getSession({ importId: req.body.importId, gymId: req.gymId, userId: req.user._id });
  const preview = await importReviewResponse(session, req.gymId, req.body.mappings);
  res.json(preview);
};

const commitMemberImport = async (req, res) => {
  const session = getSession({ importId: req.body.importId, gymId: req.gymId, userId: req.user._id });
  if (session.committed) return res.json(session.committed);
  const mappings = cleanMappings(session.headers, req.body.mappings);
  const existingMembers = await Member.find({ gymId: req.gymId }).select('_id name phone').lean();
  const review = await reviewRows({ rows: session.rows, mappings, existingMembers });
  const duplicateActions = req.body.duplicateActions && typeof req.body.duplicateActions === 'object' ? req.body.duplicateActions : {};
  const toCreate = [];
  const updates = [];
  const details = [];
  const seen = new Set();

  for (const row of review.rows) {
    if (row.errors.length) { details.push({ rowNumber: row.rowNumber, status: 'skipped', reason: row.errors.join(', ') }); continue; }
    if (row.duplicate?.type === 'file') { details.push({ rowNumber: row.rowNumber, status: 'skipped', reason: 'Duplicate mobile number in this file' }); continue; }
    if (row.duplicate?.type === 'existing') {
      if (duplicateActions[String(row.rowNumber)] !== 'update') {
        details.push({ rowNumber: row.rowNumber, status: 'skipped', reason: 'Existing member requires confirmation before updating' });
        continue;
      }
      updates.push(row);
      continue;
    }
    if (seen.has(row.phone)) { details.push({ rowNumber: row.rowNumber, status: 'skipped', reason: 'Duplicate mobile number in this file' }); continue; }
    seen.add(row.phone);
    toCreate.push(row);
  }

  let created = 0; let updated = 0; let failed = 0;
  for (let index = 0; index < toCreate.length; index += 100) {
    const batch = toCreate.slice(index, index + 100);
    try {
      await Member.insertMany(batch.map((row) => ({ gymId: req.gymId, ...payloadFromRecord(row), phoneNormalized: row.phone, status: 'inactive' })), { ordered: true });
      created += batch.length;
      batch.forEach((row) => details.push({ rowNumber: row.rowNumber, status: 'created' }));
    } catch (error) {
      failed += batch.length;
      batch.forEach((row) => details.push({ rowNumber: row.rowNumber, status: 'failed', reason: 'This row could not be imported' }));
      console.error('Member import batch error:', error.message);
    }
  }
  for (const row of updates) {
    try {
      const payload = payloadFromRecord(row);
      await Member.updateOne({ _id: row.duplicate.member.id, gymId: req.gymId }, { $set: { ...payload, phoneNormalized: row.phone } }, { runValidators: true });
      updated += 1;
      details.push({ rowNumber: row.rowNumber, status: 'updated' });
    } catch (_error) { failed += 1; details.push({ rowNumber: row.rowNumber, status: 'failed', reason: 'Existing member could not be updated' }); }
  }
  const result = { message: 'Member import completed', created, updated, skipped: details.filter((item) => item.status === 'skipped').length, failed, details: details.sort((a, b) => a.rowNumber - b.rowNumber) };
  session.committed = result;
  return res.json(result);
};

const getEnrollmentToken = (gymId) => jwt.sign(
  { gymId: gymId.toString(), purpose: 'member-enrollment' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const getEnrollmentClaims = (token) => {
  const claims = jwt.verify(token, process.env.JWT_SECRET);
  if (claims.purpose !== 'member-enrollment' || !claims.gymId) {
    throw new Error('Invalid enrollment link');
  }
  return claims;
};

const sendEnrollmentInvitation = async (req, res) => {
  try {
    const email = cleanString(req.body.email).toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const gym = await Gym.findById(req.gymId).select('gymName phone').lean();
    const clientUrl = cleanString(process.env.CLIENT_URL).split(',')[0] || 'http://localhost:5173';
    const enrollmentUrl = `${clientUrl.replace(/\/$/, '')}/enroll?token=${encodeURIComponent(getEnrollmentToken(req.gymId))}`;
    await sendEnrollmentInvitationEmail({
      toEmail: email,
      gymName: gym?.gymName,
      gymContact: gym?.phone,
      enrollmentUrl
    });

    res.json({ message: 'Enrollment form sent successfully.' });
  } catch (error) {
    console.error('Send enrollment invitation error:', error);
    res.status(500).json({ message: 'Enrollment form could not be sent. Please check your email configuration.' });
  }
};

const getEnrollmentDetails = async (req, res) => {
  try {
    const claims = getEnrollmentClaims(req.query.token);
    const gym = await Gym.findById(claims.gymId).select('gymName').lean();
    if (!gym) return res.status(404).json({ message: 'This enrollment link is no longer available.' });
    res.json({ gymName: gym.gymName });
  } catch (_error) {
    res.status(400).json({ message: 'This enrollment link is invalid or has expired.' });
  }
};

const submitEnrollment = async (req, res) => {
  try {
    const claims = getEnrollmentClaims(req.body.token);
    const payload = getMemberPayload(req.body);
    if (!payload.name || !payload.phone) {
      return res.status(400).json({ message: 'Full name and mobile are required.' });
    }

    const enrollment = new Enrollment({
      gymId: claims.gymId,
      ...payload
    });
    await enrollment.save();
    await createLog(claims.gymId, null, 'enrollment_submitted', `${enrollment.name} submitted an enrollment form.`);
    res.status(201).json({ message: 'Your enrollment details have been submitted for approval.' });
  } catch (error) {
    console.error('Submit enrollment error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'This enrollment link is invalid or has expired.' });
    }
    res.status(500).json({ message: 'Enrollment could not be submitted. Please try again.' });
  }
};

const getPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ gymId: req.gymId, status: 'pending' }).sort({ createdAt: -1 });
    res.json({ enrollments });
  } catch (error) {
    console.error('Get pending enrollments error:', error);
    res.status(500).json({ message: 'Pending enrollments could not be loaded.' });
  }
};

const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, gymId: req.gymId, status: 'pending' });
    if (!enrollment) return res.status(404).json({ message: 'Pending enrollment not found.' });

    const member = new Member({
      gymId: req.gymId,
      memberCode: await buildMemberCode(req.gymId),
      name: enrollment.name,
      phone: enrollment.phone,
      gender: enrollment.gender,
      email: enrollment.email,
      dateOfBirth: enrollment.dateOfBirth,
      address: enrollment.address,
      emergencyContactNumber: enrollment.emergencyContactNumber
    });
    await member.save();
    enrollment.status = 'approved';
    enrollment.reviewedAt = new Date();
    await enrollment.save();
    await createLog(req.gymId, member._id, 'member_joined', `${member.name}'s enrollment was approved.`);
    res.status(201).json({ message: 'Enrollment approved and member added.', member });
  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ message: 'Enrollment could not be approved.' });
  }
};

const rejectEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.id, gymId: req.gymId, status: 'pending' },
      { status: 'rejected', reviewedAt: new Date() },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ message: 'Pending enrollment not found.' });
    res.json({ message: 'Enrollment rejected.' });
  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({ message: 'Enrollment could not be rejected.' });
  }
};

const addMember = async (req, res) => {
  try {
    const payload = getMemberPayload(req.body);

    // Validation
    if (!payload.name || !payload.phone) {
      return res.status(400).json({ message: 'Full name and mobile are required' });
    }

    const member = new Member({
      gymId: req.gymId,
      memberCode: await buildMemberCode(req.gymId),
      ...payload,
      planDuration: Number(req.body.planDuration || 0),
      expiryDate: parseDate(req.body.expiryDate),
    });

    await member.save();
    await member.populate('gymId', 'gymName');
    await createLog(req.gymId, member._id, 'member_joined', `${member.name} joined the gym.`);

    res.status(201).json({
      message: 'Member added successfully',
      member
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMembers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { gymId: req.gymId };
    
    if (status && status !== 'all') {
      if (status === 'expiring') {
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(in7Days.getDate() + 7);
        query.status = 'active';
        query.expiryDate = { $gte: now, $lte: in7Days };
      } else {
        query.status = status;
      }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const allowedSort = ['createdAt', 'name', 'joiningDate', 'expiryDate', 'status'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: order };

    const members = await Member.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Member.countDocuments(query);

    res.json({
      members,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Sync member status (active/expired) based on expiryDate. Call periodically or on demand. */
const syncMemberStatus = async (req, res) => {
  try {
    const now = new Date();
    const result = await Member.updateMany(
      { gymId: req.gymId, expiryDate: { $lt: now }, status: 'active' },
      { $set: { status: 'expired' } }
    );
    const expiredToActive = await Member.updateMany(
      { gymId: req.gymId, expiryDate: { $gte: now }, status: 'expired' },
      { $set: { status: 'active' } }
    );
    res.json({
      message: 'Status synced',
      expiredCount: result.modifiedCount,
      reactivatedCount: expiredToActive.modifiedCount
    });
  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMember = async (req, res) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMemberStats = async (req, res) => {
  try {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const [totalMembers, activeMembers, expiredMembers, expiringMembers] = await Promise.all([
      Member.countDocuments({ gymId: req.gymId }),
      Member.countDocuments({ gymId: req.gymId, status: 'active' }),
      Member.countDocuments({ gymId: req.gymId, status: 'expired' }),
      Member.countDocuments({
        gymId: req.gymId,
        status: 'active',
        expiryDate: { $gte: now, $lte: in30Days }
      })
    ]);

    res.json({ totalMembers, activeMembers, expiredMembers, expiringMembers });
  } catch (error) {
    console.error('Member stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchMembers = async (req, res) => {
  try {
    const { q = '', status, limit = 20 } = req.query;
    const query = { gymId: req.gymId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { phone: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 20);

    res.json({ members });
  } catch (error) {
    console.error('Search members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getExpiringMembers = async (req, res) => {
  try {
    const days = parseInt(req.query.days || 30, 10);
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const members = await Member.find({
      gymId: req.gymId,
      status: 'active',
      expiryDate: { $gte: now, $lte: endDate }
    }).sort({ expiryDate: 1 });

    res.json({ members });
  } catch (error) {
    console.error('Expiring members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMember = async (req, res) => {
  try {
    const payload = getMemberPayload(req.body);

    const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    Object.assign(member, payload);

    await member.save();
    await createLog(req.gymId, member._id, 'member_updated', 'Member details updated.');

    res.json({
      message: 'Member updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignMembership = async (req, res) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const previousPeriodKey = membershipPeriodKey(member);
    const hasPreviousMembership = Boolean(member.membershipAssignment?.assignedAt);
    const startDate = parseDate(req.body.startDate) || new Date();
    const endDate = parseDate(req.body.endDate);
    const amountPaid = cleanNumber(req.body.amountPaid);
    const paymentMode = req.body.mode || 'cash';
    const membershipPrice = cleanNumber(req.body.membershipPrice);
    const extras = cleanNumber(req.body.extras);
    const discount = cleanNumber(req.body.discount);
    const totalAmountPayable = req.body.totalAmountPayable !== undefined
      ? cleanNumber(req.body.totalAmountPayable)
      : Math.max(membershipPrice + extras - discount, 0);

    member.membershipAssignment = {
      membershipName: cleanString(req.body.membershipName),
      membershipId: req.body.membershipId || undefined,
      startDate,
      endDate,
      plan: cleanString(req.body.plan),
      diet: cleanString(req.body.diet),
      trainer: cleanString(req.body.trainer),
      trainerSlot: cleanString(req.body.trainerSlot),
      membershipPrice,
      extras,
      discount,
      totalAmountPayable,
      invoiceDate: parseDate(req.body.invoiceDate) || new Date(),
      salesManager: cleanString(req.body.salesManager),
      note: cleanString(req.body.note),
      invoiceSendEmail: Boolean(req.body.invoiceSendEmail),
      invoiceSendChannel: ['sms', 'email', 'whatsapp'].includes(req.body.invoiceSendChannel)
        ? req.body.invoiceSendChannel
        : 'email',
      amountPaid,
      mode: paymentMode,
      paymentDueDate: parseDate(req.body.paymentDueDate),
      assignedAt: new Date()
    };
    member.planDuration = Math.max(
      0,
      Math.round(((endDate || startDate) - startDate) / (1000 * 60 * 60 * 24 * 30))
    );
    member.expiryDate = endDate;
    member.status = endDate && endDate < new Date() ? 'expired' : 'active';

    await member.save();

    const currentPeriodKey = membershipPeriodKey(member);
    if (hasPreviousMembership && previousPeriodKey !== currentPeriodKey) {
      await EmailLog.updateMany({
        gymId: req.gymId,
        memberId: member._id,
        membershipPeriodKey: previousPeriodKey,
        eventType: { $in: [EMAIL_EVENTS.EXPIRY_7_DAYS, EMAIL_EVENTS.EXPIRY_3_DAYS, EMAIL_EVENTS.EXPIRY_TODAY] },
        status: { $in: ['pending', 'failed'] }
      }, { $set: { status: 'cancelled' } });
    }

    let payment;
    if (amountPaid > 0) {
      payment = new Payment({
        gymId: req.gymId,
        memberId: member._id,
        membershipPeriodKey: currentPeriodKey,
        amount: amountPaid,
        paymentType: paymentMode,
        paymentDate: parseDate(req.body.invoiceDate) || new Date(),
        description: `Membership payment: ${member.membershipAssignment.membershipName || 'Membership'}`
      });
      await payment.save();
    }

    await createLog(req.gymId, member._id, 'member_renewed', `Membership assigned. End date: ${endDate ? endDate.toISOString().slice(0, 10) : 'not set'}.`);

    let planShare;
    try {
      planShare = await createOrReusePlanShare({ gymId: req.gymId, member, expiresInDays: req.body.planShareExpiresInDays });
      if (!planShare) await revokePlanShares(req.gymId, member._id);
    } catch (error) {
      console.error('Create plan share error:', error.message);
    }

    Gym.findById(req.gymId).lean().then((gym) => {
      if (!gym) return;
      const emailTasks = [queueEmailEvent({
        eventType: hasPreviousMembership ? EMAIL_EVENTS.MEMBERSHIP_RENEWED : EMAIL_EVENTS.WELCOME,
        gym,
        member,
        recipient: member,
        dedupeKey: `${hasPreviousMembership ? EMAIL_EVENTS.MEMBERSHIP_RENEWED : EMAIL_EVENTS.WELCOME}:${member._id}:${currentPeriodKey}`,
      })];
      if (payment) {
        const balanceDue = Math.max(totalAmountPayable - amountPaid, 0);
        emailTasks.push(queueEmailEvent({
          eventType: EMAIL_EVENTS.PAYMENT_RECEIPT,
          gym,
          member,
          payment,
          balanceDue,
          recipient: member,
          dedupeKey: `${EMAIL_EVENTS.PAYMENT_RECEIPT}:${payment._id}`,
        }));
      }
      if (planShare?.created && planShare.url) {
        emailTasks.push(sendPlanShareEmail({ share: planShare.share, url: planShare.url, gym, member }));
      }
      return Promise.all(emailTasks);
    }).catch((error) => console.error('Queue membership email error:', error.message));

    res.json({ message: 'Membership assigned successfully', member, planShare: planShare?.url ? { url: planShare.url, expiresAt: planShare.share.expiresAt } : null });
  } catch (error) {
    console.error('Assign membership error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await createLog(req.gymId, member._id, 'member_deleted', `${member.name} was removed from the gym.`);
    await Member.findByIdAndDelete(req.params.id);

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const bulkUpdateMembers = async (req, res) => {
  try {
    const { memberIds = [], updateData = {} } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'memberIds is required' });
    }

    const sanitizedUpdate = {};
    if (updateData.name) sanitizedUpdate.name = updateData.name;
    if (updateData.phone) sanitizedUpdate.phone = updateData.phone;
    if (updateData.email !== undefined) sanitizedUpdate.email = updateData.email;
    if (updateData.planDuration) sanitizedUpdate.planDuration = parseInt(updateData.planDuration, 10);

    const members = await Member.find({ _id: { $in: memberIds }, gymId: req.gymId });
    await Promise.all(members.map(async (member) => {
      Object.assign(member, sanitizedUpdate);
      await member.save();
      await createLog(req.gymId, member._id, 'member_updated', 'Member updated via bulk action.');
    }));

    res.json({ message: 'Members updated successfully', updatedCount: members.length });
  } catch (error) {
    console.error('Bulk update members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const bulkDeleteMembers = async (req, res) => {
  try {
    const { memberIds = [] } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'memberIds is required' });
    }

    const members = await Member.find({ _id: { $in: memberIds }, gymId: req.gymId });
    await Promise.all(members.map((member) =>
      createLog(req.gymId, member._id, 'member_deleted', `${member.name} was removed from the gym via bulk action.`)
    ));

    await Payment.deleteMany({ gymId: req.gymId, memberId: { $in: memberIds } });
    await Member.deleteMany({ gymId: req.gymId, _id: { $in: memberIds } });

    res.json({ message: 'Members deleted successfully', deletedCount: members.length });
  } catch (error) {
    console.error('Bulk delete members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendBulkMemberMessage = async (req, res) => {
  try {
    const { channel, memberIds, audience = 'selected', message } = req.body;
    const allowedChannels = ['email', 'sms', 'whatsapp'];
    if (!allowedChannels.includes(channel)) return res.status(400).json({ message: 'Invalid message channel.' });
    if (!cleanString(message) || cleanString(message).length > 1000) {
      return res.status(400).json({ message: 'Message is required and must be 1,000 characters or fewer.' });
    }
    if (audience !== 'all' && (!Array.isArray(memberIds) || memberIds.length === 0)) {
      return res.status(400).json({ message: 'Select at least one member.' });
    }

    const query = { gymId: req.gymId };
    if (audience !== 'all') query._id = { $in: memberIds };
    const members = await Member.find(query).select('name email phone').lean();
    if (!members.length) return res.status(404).json({ message: 'No members found for this message.' });

    const gym = await Gym.findById(req.gymId).select('gymName').lean();
    const result = await sendMemberMessage({ channel, members, message: cleanString(message), gymName: gym?.gymName });
    await createLog(req.gymId, null, 'member_bulk_message', `${channel} message sent to ${result.delivered} member(s).`);
    return res.json({ message: `${channel === 'whatsapp' ? 'WhatsApp' : channel.toUpperCase()} message queued for ${result.delivered} member(s).`, result });
  } catch (error) {
    console.error('Bulk member message error:', error.message);
    return res.status(502).json({ message: error.message || 'Member message could not be sent.' });
  }
};

module.exports = {
  addMember,
  getMembers,
  getMemberStats,
  searchMembers,
  getExpiringMembers,
  getMember,
  updateMember,
  assignMembership,
  deleteMember,
  bulkUpdateMembers,
  bulkDeleteMembers,
  sendBulkMemberMessage,
  syncMemberStatus,
  sendEnrollmentInvitation,
  getEnrollmentDetails,
  submitEnrollment,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  previewMemberImport,
  reviewMemberImport,
  commitMemberImport
};
