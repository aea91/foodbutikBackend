class BaseResponse {
      constructor(success = true, message = '', data = null, error = null) {
            this.success = success;
            this.message = message;
            this.timestamp = new Date().toISOString();

            if (error) {
                  this.error = {
                        message: error.message,
                        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
                  };
            }

            this.data = data;
      }

      static success(data = null, message = 'Success') {
            return new BaseResponse(true, message, data);
      }

      static error(error = null, message = 'Error occurred') {
            return new BaseResponse(false, message, null, error);
      }

      static paginated(items, pagination, message = 'Success') {
            const paginatedData = {
                  items,
                  pagination: {
                        page: pagination.page,
                        limit: pagination.limit,
                        totalItems: pagination.totalItems,
                        totalPages: Math.ceil(pagination.totalItems / pagination.limit),
                        hasNextPage: pagination.page < Math.ceil(pagination.totalItems / pagination.limit),
                        hasPrevPage: pagination.page > 1
                  }
            };

            return new BaseResponse(true, message, paginatedData);
      }
}

module.exports = BaseResponse; 