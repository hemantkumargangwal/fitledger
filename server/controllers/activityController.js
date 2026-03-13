const ActivityLog = require('../models/ActivityLog');
const Member = require('../models/Member');

/** Activity logs for a single member (member profile page) */
const getMemberActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findOne({ _id: id, gymId: req.gymId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const logs = await ActivityLog.find({ memberId: id, gymId: req.gymId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ activity: logs });
  } catch (error) {
    console.error('Member activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMemberActivity
};
