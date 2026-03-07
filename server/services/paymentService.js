const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { AppError } = require('../utils/errorHandler');
const { validateObjectId } = require('../utils/validators');

class PaymentService {
  // Get all payments with pagination and filters
  async getPayments(query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      search,
      paymentType,
      memberId,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build filter
    const filter = {};
    
    if (paymentType && paymentType !== 'all') {
      filter.paymentType = paymentType;
    }

    if (memberId) {
      filter.memberId = memberId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { amount: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate('memberId', 'name email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    return {
      payments,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  // Get payment by ID
  async getPaymentById(id) {
    if (!validateObjectId(id)) {
      throw new AppError('Invalid payment ID', 400);
    }

    const payment = await Payment.findById(id).populate('memberId', 'name email phone');
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  // Create new payment
  async createPayment(paymentData) {
    // Verify member exists
    const member = await Member.findById(paymentData.memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    const payment = new Payment(paymentData);
    await payment.save();

    // Update member expiry date if needed
    if (paymentData.extendMembership) {
      const currentExpiry = member.expiryDate || new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setMonth(newExpiry.getMonth() + (paymentData.months || 1));
      
      await Member.findByIdAndUpdate(paymentData.memberId, {
        expiryDate: newExpiry,
        status: 'active'
      });
    }

    return await Payment.findById(payment._id).populate('memberId', 'name email phone');
  }

  // Update payment
  async updatePayment(id, updateData) {
    if (!validateObjectId(id)) {
      throw new AppError('Invalid payment ID', 400);
    }

    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('memberId', 'name email phone');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  // Delete payment
  async deletePayment(id) {
    if (!validateObjectId(id)) {
      throw new AppError('Invalid payment ID', 400);
    }

    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  // Get revenue summary
  async getRevenueSummary(period = 'month') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const revenueData = await Payment.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averagePayment: { $avg: '$amount' },
        },
      },
    ]);

    const paymentTypes = await Payment.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    return {
      summary: revenueData[0] || {
        totalRevenue: 0,
        totalPayments: 0,
        averagePayment: 0,
      },
      paymentTypes,
      period,
    };
  }

  // Get payment analytics
  async getPaymentAnalytics(params = {}) {
    const { period = 'month', groupBy = 'day' } = params;
    
    let startDate, groupFormat;
    
    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
    }

    const analytics = await Payment.aggregate([
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
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return analytics;
  }

  // Get payment modes distribution
  async getPaymentModes() {
    const distribution = await Payment.aggregate([
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

    return distribution;
  }

  // Get recent payments
  async getRecentPayments(limit = 10) {
    const payments = await Payment.find()
      .populate('memberId', 'name email phone')
      .sort({ date: -1 })
      .limit(limit);

    return payments;
  }

  // Search payments
  async searchPayments(query, filters = {}) {
    const searchQuery = {
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { amount: { $regex: query, $options: 'i' } },
      ],
      ...filters,
    };

    const payments = await Payment.find(searchQuery)
      .populate('memberId', 'name email phone')
      .limit(20);

    return payments;
  }

  // Export payments data
  async exportPayments(filters = {}) {
    const payments = await Payment.find(filters)
      .populate('memberId', 'name email phone')
      .sort({ date: -1 });

    return payments;
  }
}

module.exports = new PaymentService();
