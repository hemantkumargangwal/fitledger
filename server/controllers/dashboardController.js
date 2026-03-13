const Member = require('../models/Member');
const Payment = require('../models/Payment');

const getDashboardStats = async (req, res) => {
  try {
    const gymId = req.gymId;
    const now = new Date();

    // Get total members
    const totalMembers = await Member.countDocuments({ gymId });

    // Get active members
    const activeMembers = await Member.countDocuments({
      gymId,
      status: 'active'
    });

    // New members this month (current calendar month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const newMembersThisMonth = await Member.countDocuments({
      gymId,
      joiningDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await Member.countDocuments({
      gymId,
      status: 'active',
      expiryDate: { $lte: thirtyDaysFromNow }
    });

    // Total revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Payment.aggregate([
      {
        $match: {
          gymId,
          paymentDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    res.json({
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      expiringSoon,
      totalRevenue
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMemberGrowthChart = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let startDate = new Date();
    if (period === '6months') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === '3months') {
      startDate.setMonth(startDate.getMonth() - 3);
    }

    const memberGrowth = await Member.aggregate([
      {
        $match: {
          gymId: req.gymId,
          joiningDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joiningDate' },
            month: { $month: '$joiningDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for chart
    const formattedData = memberGrowth.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      members: item.count
    }));

    res.json({ data: formattedData });
  } catch (error) {
    console.error('Member growth chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let startDate = new Date();
    if (period === '6months') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === '3months') {
      startDate.setMonth(startDate.getMonth() - 3);
    }

    const revenueData = await Payment.aggregate([
      {
        $match: {
          gymId: req.gymId,
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for chart
    const formattedData = revenueData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue
    }));

    res.json({ data: formattedData });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecentMembers = async (req, res) => {
  try {
    const recentMembers = await Member.find({ gymId: req.gymId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name phone email joiningDate expiryDate status');

    res.json({ members: recentMembers });
  } catch (error) {
    console.error('Recent members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getExpiringMembers = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const members = await Member.find({
      gymId: req.gymId,
      status: 'active',
      expiryDate: { $lte: endDate, $gte: new Date() }
    })
      .sort({ expiryDate: 1 })
      .limit(100)
      .select('name phone email joiningDate expiryDate status');

    res.json({ members });
  } catch (error) {
    console.error('Expiring members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Payment method distribution (last 30 days) for pie chart
const PAYMENT_TYPE_COLORS = { cash: '#10b981', upi: '#8b5cf6', card: '#3b82f6' };

const getPaymentDistribution = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const distribution = await Payment.aggregate([
      {
        $match: {
          gymId: req.gymId,
          paymentDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$paymentType',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAmount = distribution.reduce((sum, d) => sum + d.total, 0);
    const data = distribution.map((d) => {
      const name = d._id.charAt(0).toUpperCase() + d._id.slice(1);
      const value = totalAmount > 0 ? Math.round((d.total / totalAmount) * 100) : 0;
      return {
        name: name === 'Upi' ? 'UPI' : name,
        value,
        amount: d.total,
        count: d.count,
        color: PAYMENT_TYPE_COLORS[d._id] || '#94a3b8'
      };
    });

    res.json({ distribution: data, totalAmount });
  } catch (error) {
    console.error('Payment distribution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Revenue summary: today, this week, this month (for summary cards) */
const getRevenueSummary = async (req, res) => {
  try {
    const gymId = req.gymId;
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayResult, weekResult, monthResult] = await Promise.all([
      Payment.aggregate([
        { $match: { gymId, paymentDate: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { gymId, paymentDate: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { gymId, paymentDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      today: todayResult[0]?.total || 0,
      week: weekResult[0]?.total || 0,
      month: monthResult[0]?.total || 0
    });
  } catch (error) {
    console.error('Revenue summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Daily revenue for last N days (for charts or breakdown) */
const getDailyRevenue = async (req, res) => {
  try {
    const { days = 14 } = req.query;
    const start = new Date();
    start.setDate(start.getDate() - parseInt(days, 10));
    start.setHours(0, 0, 0, 0);

    const data = await Payment.aggregate([
      { $match: { gymId: req.gymId, paymentDate: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
            day: { $dayOfMonth: '$paymentDate' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const formatted = data.map((d) => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
      revenue: d.revenue
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('Daily revenue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Expiring membership alerts: counts by 7/14/30 days + short list for widget */
const getExpiringAlerts = async (req, res) => {
  try {
    const now = new Date();
    const in7 = new Date(now);
    in7.setDate(now.getDate() + 7);
    const in14 = new Date(now);
    in14.setDate(now.getDate() + 14);
    const in30 = new Date(now);
    in30.setDate(now.getDate() + 30);

    const [count7, count14, count30, members] = await Promise.all([
      Member.countDocuments({
        gymId: req.gymId,
        status: 'active',
        expiryDate: { $gte: now, $lte: in7 }
      }),
      Member.countDocuments({
        gymId: req.gymId,
        status: 'active',
        expiryDate: { $gte: now, $lte: in14 }
      }),
      Member.countDocuments({
        gymId: req.gymId,
        status: 'active',
        expiryDate: { $gte: now, $lte: in30 }
      }),
      Member.find({
        gymId: req.gymId,
        status: 'active',
        expiryDate: { $lte: in30, $gte: now }
      })
        .sort({ expiryDate: 1 })
        .limit(10)
        .select('name phone expiryDate')
    ]);

    res.json({
      count7,
      count14,
      count30,
      members
    });
  } catch (error) {
    console.error('Expiring alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Recent activity for gym (dashboard feed) */
const getGymActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const ActivityLog = require('../models/ActivityLog');

    const logs = await ActivityLog.find({ gymId: req.gymId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('memberId', 'name')
      .lean();

    res.json({ activity: logs });
  } catch (error) {
    console.error('Gym activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getMemberGrowthChart,
  getRevenueChart,
  getRecentMembers,
  getExpiringMembers,
  getPaymentDistribution,
  getRevenueSummary,
  getDailyRevenue,
  getExpiringAlerts,
  getGymActivity
};
