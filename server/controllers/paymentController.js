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
    const { memberId, paymentType, startDate, endDate, search, page = 1, limit = 10 } = req.query;
    
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

    if (search?.trim()) {
      const members = await Member.find({
        gymId: req.gymId,
        name: { $regex: search.trim(), $options: 'i' }
      }).select('_id');

      const amount = Number(search);
      query.$or = [
        { description: { $regex: search.trim(), $options: 'i' } },
        { memberId: { $in: members.map((m) => m._id) } }
      ];

      if (!Number.isNaN(amount)) {
        query.$or.push({ amount });
      }
    }

    const payments = await Payment.find(query)
      .populate('memberId', 'name phone email')
      .sort({ paymentDate: -1, createdAt: -1 })
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

const updatePayment = async (req, res) => {
  try {
    const { amount, paymentType, paymentDate, description } = req.body;
    const payment = await Payment.findOne({ _id: req.params.id, gymId: req.gymId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (amount !== undefined) payment.amount = parseFloat(amount);
    if (paymentType) payment.paymentType = paymentType;
    if (paymentDate) payment.paymentDate = new Date(paymentDate);
    if (description !== undefined) payment.description = description;

    await payment.save();
    await payment.populate('memberId', 'name phone email');
    await createLog(req.gymId, payment.memberId._id, 'payment_received', `Payment updated to ₹${payment.amount} (${payment.paymentType}).`, { amount: payment.amount, paymentId: payment._id });

    res.json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, gymId: req.gymId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
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

const getPaymentAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const startDate = new Date();
    if (period === '7days') startDate.setDate(startDate.getDate() - 7);
    else if (period === '1year') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate.setDate(startDate.getDate() - 30);

    const analytics = await Payment.aggregate([
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
            month: { $month: '$paymentDate' },
            day: { $dayOfMonth: '$paymentDate' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      analytics: analytics.map((item) => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        revenue: item.revenue,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPaymentModes = async (req, res) => {
  try {
    const modes = await Payment.aggregate([
      { $match: { gymId: req.gymId } },
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ modes });
  } catch (error) {
    console.error('Payment modes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecentPayments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 10, 10);
    const payments = await Payment.find({ gymId: req.gymId })
      .populate('memberId', 'name phone email')
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(limit);

    res.json({ payments });
  } catch (error) {
    console.error('Recent payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchPayments = async (req, res) => {
  try {
    const { q = '', paymentType, startDate, endDate, limit = 20 } = req.query;
    const query = { gymId: req.gymId };

    if (paymentType && paymentType !== 'all') query.paymentType = paymentType;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    if (q.trim()) {
      const members = await Member.find({
        gymId: req.gymId,
        name: { $regex: q.trim(), $options: 'i' }
      }).select('_id');

      query.$or = [
        { description: { $regex: q.trim(), $options: 'i' } },
        { memberId: { $in: members.map((m) => m._id) } }
      ];

      const amount = Number(q);
      if (!Number.isNaN(amount)) {
        query.$or.push({ amount });
      }
    }

    const payments = await Payment.find(query)
      .populate('memberId', 'name phone email')
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(parseInt(limit, 10) || 20);

    res.json({ payments });
  } catch (error) {
    console.error('Search payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, gymId: req.gymId })
      .populate('memberId', 'name phone email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const lines = [
      'FitLedger Payment Receipt',
      `Receipt ID: ${payment._id}`,
      `Member: ${payment.memberId?.name || 'Unknown'}`,
      `Phone: ${payment.memberId?.phone || '—'}`,
      `Amount: ₹${payment.amount.toFixed(2)}`,
      `Payment Mode: ${payment.paymentType.toUpperCase()}`,
      `Payment Date: ${new Date(payment.paymentDate).toLocaleDateString('en-IN')}`,
      `Description: ${payment.description || '—'}`
    ];

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment._id}.txt`);
    res.send(lines.join('\n'));
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportPayments = async (req, res) => {
  try {
    const { paymentType, startDate, endDate } = req.query;
    const query = { gymId: req.gymId };

    if (paymentType && paymentType !== 'all') query.paymentType = paymentType;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('memberId', 'name phone email')
      .sort({ paymentDate: -1, createdAt: -1 })
      .lean();

    const headers = ['Payment ID', 'Member Name', 'Phone', 'Amount', 'Payment Type', 'Payment Date', 'Description'];
    const escapeCSV = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = payments.map((row) => ([
      row._id,
      row.memberId?.name || '',
      row.memberId?.phone || '',
      row.amount,
      row.paymentType,
      new Date(row.paymentDate).toISOString(),
      row.description || ''
    ].map(escapeCSV).join(',')));
    const csv = [headers.map(escapeCSV).join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=payments-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  getRevenueSummary,
  getPaymentAnalytics,
  getPaymentModes,
  getRecentPayments,
  searchPayments,
  generateReceipt,
  exportPayments
};
