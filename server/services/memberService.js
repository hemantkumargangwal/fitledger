const Member = require('../models/Member');
const Payment = require('../models/Payment');
const { AppError } = require('../utils/errorHandler');
const { validateObjectId } = require('../utils/validators');

class MemberService {
  // Get all members with pagination and filters
  async getMembers(query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
    } = query;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Member.countDocuments(filter);

    return {
      members,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  // Get member by ID
  async getMemberById(id) {
    if (!validateObjectId(id)) {
      throw new AppError('Invalid member ID', 400);
    }

    const member = await Member.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    return member;
  }

  // Create new member
  async createMember(memberData) {
    const member = new Member(memberData);
    await member.save();
    return member;
  }

  // Update member
  async updateMember(id, updateData) {
    if (!validateObjectId(id)) {
      throw new AppError('Invalid member ID', 400);
    }

    const member = await Member.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    return member;
  }

  // Delete member
  async deleteMember(id) {
    if (!validateObjectId(id)) {
      throw new AppError('Invalid member ID', 400);
    }

    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // Also delete related payments
    await Payment.deleteMany({ memberId: id });

    return member;
  }

  // Get member statistics
  async getMemberStats() {
    const stats = await Member.aggregate([
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          activeMembers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          expiringSoon: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'active'] },
                    { $lte: ['$expiryDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          },
        }
      }
    ]);

    return stats[0] || {
      totalMembers: 0,
      activeMembers: 0,
      expiringSoon: 0,
    };
  }

  // Search members
  async searchMembers(query, filters = {}) {
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
      ...filters,
    };

    const members = await Member.find(searchQuery).limit(20);
    return members;
  }

  // Get expiring members
  async getExpiringMembers(days = 30) {
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    const members = await Member.find({
      status: 'active',
      expiryDate: { $lte: expiryDate },
    }).sort({ expiryDate: 1 });

    return members;
  }

  // Bulk update members
  async bulkUpdate(memberIds, updateData) {
    const result = await Member.updateMany(
      { _id: { $in: memberIds } },
      updateData,
      { runValidators: true }
    );

    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  // Bulk delete members
  async bulkDelete(memberIds) {
    // Delete members
    const result = await Member.deleteMany({ _id: { $in: memberIds } });
    
    // Delete related payments
    await Payment.deleteMany({ memberId: { $in: memberIds } });

    return {
      deletedCount: result.deletedCount,
    };
  }

  // Update member status based on expiry date
  async updateExpiredMembers() {
    const expiredMembers = await Member.updateMany(
      {
        status: 'active',
        expiryDate: { $lt: new Date() },
      },
      { status: 'expired' }
    );

    // Update expiring soon members
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoonMembers = await Member.updateMany(
      {
        status: 'active',
        expiryDate: { $lte: thirtyDaysFromNow },
        $or: [
          { status: { $ne: 'expiring' } },
          { status: null }
        ]
      },
      { status: 'expiring' }
    );

    return {
      expiredCount: expiredMembers.modifiedCount,
      expiringSoonCount: expiringSoonMembers.modifiedCount,
    };
  }
}

module.exports = new MemberService();
