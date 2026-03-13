const Member = require('../models/Member');
const { createLog } = require('../services/activityService');

const addMember = async (req, res) => {
  try {
    const { name, phone, email, joiningDate, planDuration } = req.body;

    // Validation
    if (!name || !phone || !planDuration) {
      return res.status(400).json({ message: 'Name, phone, and plan duration are required' });
    }

    // Calculate expiry date
    const joining = joiningDate ? new Date(joiningDate) : new Date();
    const expiry = new Date(joining);
    expiry.setMonth(expiry.getMonth() + parseInt(planDuration));

    const member = new Member({
      gymId: req.gymId,
      name,
      phone,
      email,
      joiningDate: joining,
      planDuration: parseInt(planDuration),
      expiryDate: expiry
    });

    await member.save();
    await member.populate('gymId', 'gymName');
    await createLog(req.gymId, member._id, 'member_joined', `${name} joined the gym. Plan: ${planDuration} month(s).`);

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
      query.status = status;
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

const updateMember = async (req, res) => {
  try {
    const { name, phone, email, planDuration } = req.body;

    const member = await Member.findOne({ _id: req.params.id, gymId: req.gymId });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const planChanged = planDuration != null && parseInt(planDuration, 10) !== member.planDuration;

    // Update fields
    if (name) member.name = name;
    if (phone) member.phone = phone;
    if (email !== undefined) member.email = email;
    if (planDuration) {
      member.planDuration = parseInt(planDuration);
      const expiry = new Date(member.joiningDate);
      expiry.setMonth(expiry.getMonth() + parseInt(planDuration));
      member.expiryDate = expiry;
    }

    await member.save();

    if (planChanged) {
      await createLog(req.gymId, member._id, 'member_renewed', `Plan updated. New expiry: ${member.expiryDate.toISOString().slice(0, 10)}.`);
    } else {
      await createLog(req.gymId, member._id, 'member_updated', 'Member details updated.');
    }

    res.json({
      message: 'Member updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member error:', error);
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

module.exports = {
  addMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
  syncMemberStatus
};
