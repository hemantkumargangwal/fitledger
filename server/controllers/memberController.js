const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Gym = require('../models/Gym');
const { createLog } = require('../services/activityService');
const { sendMemberWelcomeEmail } = require('../services/emailService');

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

    let welcomeEmail = { delivered: false, channel: 'msg91', reason: 'not_attempted' };
    try {
      welcomeEmail = await sendMemberWelcomeEmail({
        toEmail: member.email,
        memberName: member.name,
        gymName: member.gymId?.gymName
      });
    } catch (emailError) {
      console.error(`Welcome email failed for member ${member._id}:`, emailError.message);
      welcomeEmail = { delivered: false, channel: 'msg91', reason: 'delivery_failed' };
    }

    res.status(201).json({
      message: 'Member added successfully',
      member,
      welcomeEmail
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

    if (amountPaid > 0) {
      const payment = new Payment({
        gymId: req.gymId,
        memberId: member._id,
        amount: amountPaid,
        paymentType: paymentMode,
        paymentDate: parseDate(req.body.invoiceDate) || new Date(),
        description: `Membership payment: ${member.membershipAssignment.membershipName || 'Membership'}`
      });
      await payment.save();
    }

    await createLog(req.gymId, member._id, 'member_renewed', `Membership assigned. End date: ${endDate ? endDate.toISOString().slice(0, 10) : 'not set'}.`);

    res.json({ message: 'Membership assigned successfully', member });
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
  syncMemberStatus
};
