class BaseResponse {
      constructor(success = true, message = '', data = null, error = null) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.timestamp = new Date().toISOString();

            if (error) {
                  this.error = {
                        message: error.message,
                        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
                  };
            }
      }

      static success(data = null, message = 'Success') {
            return new BaseResponse(true, message, data);
      }

      static error(error = null, message = 'Error occurred') {
            return new BaseResponse(false, message, null, error);
      }
}

module.exports = BaseResponse; 