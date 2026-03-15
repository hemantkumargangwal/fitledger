const Member = require('../models/Member');
const Payment = require('../models/Payment');
const { AppError } = require('../utils/errorHandler');

class DashboardService {
  // Get dashboard statistics
  async getStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      activeMembers,
      expiringSoon,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Member.countDocuments({
        status: 'active',
        expiryDate: { $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      }),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        {
          $match: { date: { $gte: startOfMonth } }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    ]);

    return {
      totalMembers,
      activeMembers,
      expiringSoon,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
    };
  }

  // Get member growth data
  async getMemberGrowth(period = '30d') {
    let startDate, groupFormat;

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
    }

    const growthData = await Member.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$createdAt',
            },
          },
          newMembers: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return { data: growthData };
  }

  // Get revenue data
  async getRevenueData(period = '30d') {
    let startDate, groupFormat;

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
    }

    const revenueData = await Payment.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$date',
            },
          },
          revenue: { $sum: '$amount' },
          payments: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return { data: revenueData };
  }

  // Get payment modes data
  async getPaymentModes() {
    const paymentModes = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    return { data: paymentModes };
  }

  // Get recent members
  async getRecentMembers(limit = 5) {
    const recentMembers = await Member.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email phone joiningDate expiryDate status');

    return { members: recentMembers };
  }

  // Get recent payments
  async getRecentPayments(limit = 5) {
    const recentPayments = await Payment.find()
      .populate('memberId', 'name email')
      .sort({ date: -1 })
      .limit(limit);

    return { payments: recentPayments };
  }

  // Get activity feed
  async getActivityFeed(limit = 10) {
    const recentMembers = await Member.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name createdAt')
      .lean();

    const recentPayments = await Payment.find()
      .populate('memberId', 'name')
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Combine and format activities
    const activities = [
      ...recentMembers.map(member => ({
        type: 'member_joined',
        description: `${member.name} joined the gym`,
        timestamp: member.createdAt,
        data: member,
      })),
      ...recentPayments.map(payment => ({
        type: 'payment_received',
        description: `Payment of ₹${payment.amount} received from ${payment.memberId?.name || 'Unknown'}`,
        timestamp: payment.date,
        data: payment,
      })),
    ];

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { activities: activities.slice(0, limit) };
  }

  // Get membership trends
  async getMembershipTrends(period = '90d') {
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const trends = await Member.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          newMembers: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return { data: trends };
  }

  // Get financial overview
  async getFinancialOverview(period = '30d') {
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      totalPayments,
      averagePayment,
      paymentModes,
      dailyRevenue,
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { date: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.countDocuments({ date: { $gte: startDate } }),
      Payment.aggregate([
        { $match: { date: { $gte: startDate } } },
        { $group: { _id: null, avg: { $avg: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: '$paymentType',
            count: { $sum: 1 },
            total: { $sum: '$amount' },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPayments,
        averagePayment: averagePayment[0]?.avg || 0,
      },
      paymentModes,
      dailyRevenue,
    };
  }

  // Get upcoming renewals
  async getUpcomingRenewals(days = 30) {
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const renewals = await Member.find({
      status: 'active',
      expiryDate: { $lte: expiryDate },
    })
      .sort({ expiryDate: 1 })
      .select('name email phone expiryDate planDuration')
      .limit(20);

    return { renewals };
  }
}

module.exports = new DashboardService();
