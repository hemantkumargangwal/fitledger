const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { createLog } = require('../services/activityService');

const addPayment = async (req, res) => {
  try {
    const { memberId, amount, paymentType, paymentDate, description } = req.body;

    // Validation
    if (!memberId || !amount || !paymentType) {
      return res.status(400).json({ message: 'Member ID, amount, and payment type are required' });
    }

    // Check if member exists and belongs to the gym
    const member = await Member.findOne({ _id: memberId, gymId: req.gymId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const payment = new Payment({
      gymId: req.gymId,
      memberId,
      amount: parseFloat(amount),
      paymentType,
      ...(paymentDate && { paymentDate: new Date(paymentDate) }),
      description
    });

    await payment.save();
    await payment.populate('memberId', 'name phone email');
    await createLog(req.gymId, memberId, 'payment_received', `Payment of ₹${payment.amount} received (${payment.paymentType}).`, { amount: payment.amount, paymentId: payment._id });

    res.status(201).json({
      message: 'Payment added successfully',
      payment
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayments = async (req, res) => {
  try {
    const { memberId, paymentType, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { gymId: req.gymId };
    
    if (memberId) {
      query.memberId = memberId;
    }
    
    if (paymentType && paymentType !== 'all') {
      query.paymentType = paymentType;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('memberId', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, gymId: req.gymId })
      .populate('memberId', 'name phone email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRevenueSummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
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
          _id: '$paymentType',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          gymId: req.gymId,
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      revenueByType: revenueData,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalPayments: totalRevenue[0]?.count || 0
    });
  } catch (error) {
    console.error('Get revenue summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addPayment,
  getPayments,
  getPayment,
  getRevenueSummary
};
