const { AppError } = require('../utils/errorHandler');

const validate = (validator, source = 'body') => (req, _res, next) => {
  const result = validator(req[source] || {});
  if (result?.errors?.length) {
    return next(new AppError(
      'Request validation failed',
      400,
      'VALIDATION_ERROR',
      result.errors
    ));
  }
  if (result?.value) req[source] = result.value;
  return next();
};

module.exports = { validate };
