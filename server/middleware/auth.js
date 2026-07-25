const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(new AppError('Authentication token is required', 401, 'AUTHENTICATION_REQUIRED'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('gymId');
    
    if (!user) {
      return next(new AppError('Authentication token is invalid', 401, 'INVALID_TOKEN'));
    }

    if (user.status !== 'active') {
      return next(new AppError('This account is disabled', 403, 'ACCOUNT_DISABLED'));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password was changed. Please sign in again.', 401, 'TOKEN_REVOKED'));
    }

    req.user = user;
    req.gymId = user.gymId._id;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
