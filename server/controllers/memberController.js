const Member = require('../models/Member');

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
    const { search, status, page = 1, limit = 10 } = req.query;
    
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

    const members = await Member.find(query)
      .sort({ createdAt: -1 })
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

    // Update fields
    if (name) member.name = name;
    if (phone) member.phone = phone;
    if (email) member.email = email;
    if (planDuration) {
      member.planDuration = parseInt(planDuration);
      // Recalculate expiry date
      const expiry = new Date(member.joiningDate);
      expiry.setMonth(expiry.getMonth() + parseInt(planDuration));
      member.expiryDate = expiry;
    }

    await member.save();

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
  deleteMember
};
