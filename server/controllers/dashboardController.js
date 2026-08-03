const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Enquiry = require('../models/Enquiry');
const ActivityLog = require('../models/ActivityLog');

const buildMonthSeries = (monthsBack = 6) => {
  const now = new Date();
  return Array.from({ length: monthsBack }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return { key, label: date.toLocaleString('en-IN', { month: 'short' }) };
  });
};

const getRange = (date) => ({
  start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
  end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
});

const sumPaymentAmount = async (gymId, start, end) => {
  const result = await Payment.aggregate([
    { $match: { gymId, paymentDate: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return result[0]?.total || 0;
};

const getOwnerOverview = async (req, res) => {
  try {
    const gymId = req.gymId;
    const now = new Date();
    const today = getRange(now);
    const yesterday = new Date(today.start);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayRange = getRange(yesterday);
    const last7DaysStart = new Date(today.start);
    last7DaysStart.setDate(last7DaysStart.getDate() - 6);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const next30Days = new Date(today.start);
    next30Days.setDate(next30Days.getDate() + 30);
    const months = buildMonthSeries(6);
    const firstSeriesMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalMembers,
      newThisMonth,
      newLastMonth,
      lostThisMonth,
      lostLastMonth,
      lostTotal,
      incomeToday,
      incomeThisMonth,
      incomeLastMonth,
      popularMembership,
      incomeTrendRaw,
      newTrendRaw,
      lostTrendRaw,
      renewTrendRaw,
      dueTrendRaw,
      visitsToday,
      visitsYesterday,
      visitsLast7Days,
      enquiryTrendRaw,
      genderDistributionRaw
    ] = await Promise.all([
      Member.countDocuments({ gymId }),
      Member.countDocuments({ gymId, joiningDate: { $gte: startOfThisMonth, $lte: endOfThisMonth } }),
      Member.countDocuments({ gymId, joiningDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Member.countDocuments({ gymId, expiryDate: { $gte: startOfThisMonth, $lt: today.start } }),
      Member.countDocuments({ gymId, expiryDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Member.countDocuments({ gymId, expiryDate: { $lt: today.start } }),
      sumPaymentAmount(gymId, today.start, today.end),
      sumPaymentAmount(gymId, startOfThisMonth, endOfThisMonth),
      sumPaymentAmount(gymId, startOfLastMonth, endOfLastMonth),
      Member.aggregate([
        { $match: { gymId, 'membershipAssignment.membershipName': { $exists: true, $ne: '' } } },
        {
          $group: {
            _id: {
              name: '$membershipAssignment.membershipName',
              durationMonths: '$planDuration'
            },
            members: { $sum: 1 }
          }
        },
        { $sort: { members: -1 } },
        { $limit: 1 }
      ]),
      Payment.aggregate([
        { $match: { gymId, paymentDate: { $gte: firstSeriesMonth } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
            value: { $sum: '$amount' }
          }
        }
      ]),
      Member.aggregate([
        { $match: { gymId, joiningDate: { $gte: firstSeriesMonth } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$joiningDate' } },
            value: { $sum: 1 }
          }
        }
      ]),
      Member.aggregate([
        { $match: { gymId, expiryDate: { $gte: firstSeriesMonth, $lt: today.start } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$expiryDate' } },
            value: { $sum: 1 }
          }
        }
      ]),
      ActivityLog.aggregate([
        { $match: { gymId, action: 'member_renewed', createdAt: { $gte: firstSeriesMonth } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            value: { $sum: 1 }
          }
        }
      ]),
      Member.aggregate([
        {
          $match: {
            gymId,
            'membershipAssignment.paymentDueDate': { $gte: firstSeriesMonth },
            $expr: {
              $gt: [
                { $subtract: ['$membershipAssignment.totalAmountPayable', '$membershipAssignment.amountPaid'] },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$membershipAssignment.paymentDueDate' } },
            value: {
              $sum: { $subtract: ['$membershipAssignment.totalAmountPayable', '$membershipAssignment.amountPaid'] }
            }
          }
        }
      ]),
      Enquiry.countDocuments({ gymId, enquiryDate: { $gte: today.start, $lte: today.end } }),
      Enquiry.countDocuments({ gymId, enquiryDate: { $gte: yesterdayRange.start, $lte: yesterdayRange.end } }),
      Enquiry.countDocuments({ gymId, enquiryDate: { $gte: last7DaysStart, $lte: today.end } }),
      Enquiry.aggregate([
        { $match: { gymId, enquiryDate: { $gte: firstSeriesMonth } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$enquiryDate' } },
            value: { $sum: 1 }
          }
        }
      ]),
      Member.aggregate([
        { $match: { gymId, gender: { $in: ['male', 'female', 'other'] } } },
        { $group: { _id: '$gender', value: { $sum: 1 } } }
      ])
    ]);

    const mapSeries = (raw) => {
      const lookup = new Map(raw.map((item) => [item._id, item.value]));
      return months.map((month) => ({ month: month.key, label: month.label, value: lookup.get(month.key) || 0 }));
    };

    const incomeByMonth = mapSeries(incomeTrendRaw);
    const expenseByMonth = months.map((month) => ({ month: month.key, label: month.label, value: 0 }));

    res.json({
      cards: {
        visits: { today: visitsToday, yesterday: visitsYesterday, last7Days: visitsLast7Days },
        popularMembership: {
          name: popularMembership[0]?._id?.name || 'No membership assigned',
          durationMonths: popularMembership[0]?._id?.durationMonths || 0,
          members: popularMembership[0]?.members || 0
        },
        expenses: { today: 0, thisMonth: 0, lastMonth: 0 },
        members: { total: totalMembers, newThisMonth, newLastMonth },
        memberLost: { thisMonth: lostThisMonth, lastMonth: lostLastMonth, total: lostTotal },
        profit: {
          today: incomeToday,
          thisMonth: incomeThisMonth,
          lastMonth: incomeLastMonth
        }
      },
      charts: {
        expense: expenseByMonth,
        income: incomeByMonth,
        enquiry: mapSeries(enquiryTrendRaw),
        paymentDue: mapSeries(dueTrendRaw),
        genderDistribution: ['male', 'female', 'other'].map((gender) => ({
          name: gender.charAt(0).toUpperCase() + gender.slice(1),
          value: genderDistributionRaw.find((item) => item._id === gender)?.value || 0
        })),
        memberLost: mapSeries(lostTrendRaw),
        newMembers: mapSeries(newTrendRaw),
        renewals: mapSeries(renewTrendRaw)
      }
    });
  } catch (error) {
    console.error('Owner overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    res.status(200).json({
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
  getGymActivity,
  getOwnerOverview
};
