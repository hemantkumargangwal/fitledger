// Standardized API response helper
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      requestId: res.req?.requestId,
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'RESOURCE_NOT_FOUND' : 'REQUEST_FAILED',
        message,
        ...(errors ? { fields: errors } : {}),
      },
      message,
      errors,
      requestId: res.req?.requestId,
    });
  }

  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static conflict(res, message = 'Resource already exists') {
    return this.error(res, message, 409);
  }

  // Pagination helper
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
      requestId: res.req?.requestId,
    });
  }
}

module.exports = ApiResponse;
