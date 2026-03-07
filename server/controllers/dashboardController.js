const Member = require('../models/Member');
const Payment = require('../models/Payment');

const getDashboardStats = async (req, res) => {
  try {
    const gymId = req.gymId;

    // Get total members
    const totalMembers = await Member.countDocuments({ gymId });

    // Get active members
    const activeMembers = await Member.countDocuments({ 
      gymId, 
      status: 'active' 
    });

    // Get expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoon = await Member.countDocuments({
      gymId,
      status: 'active',
      expiryDate: { $lte: thirtyDaysFromNow }
    });

    // Get total revenue (last 30 days)
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

module.exports = {
  getDashboardStats,
  getMemberGrowthChart,
  getRevenueChart,
  getRecentMembers
};
