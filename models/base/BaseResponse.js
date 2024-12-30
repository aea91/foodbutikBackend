/**
 * Standart API yanıt formatı
 * Tüm API endpoint'leri için tutarlı bir yanıt yapısı sağlar
 */
class BaseResponse {
      /**
       * BaseResponse constructor
       * @param {boolean} success - İşlem başarı durumu
       * @param {string} message - İşlem mesajı
       * @param {any} data - Yanıt verisi
       * @param {Object} error - Hata detayları
       */
      constructor(success = true, message = '', data = null, error = null) {
            this.success = success;
            this.message = message;
            this.timestamp = new Date().toISOString();

            if (error) {
                  this.error = {
                        message: error.message,
                        code: error.code || 500
                  };
            }

            if (data !== null) {
                  this.data = data;
            }
      }

      /**
       * Başarılı yanıt oluşturur
       * @param {any} data - Yanıt verisi
       * @param {string} message - Başarı mesajı
       */
      static success(data = null, message = 'Success') {
            return new BaseResponse(true, message, data);
      }

      /**
       * Hata yanıtı oluşturur
       * @param {Error} error - Hata objesi
       * @param {string} message - Hata mesajı
       */
      static error(error = null, message = 'Error occurred') {
            return new BaseResponse(false, message, null, error);
      }

      /**
       * Sayfalanmış yanıt oluşturur
       * @param {Array} items - Sayfa öğeleri
       * @param {Object} pagination - Sayfalama bilgileri
       * @param {string} message - Başarı mesajı
       */
      static paginated(items, pagination, message = 'Success') {
            const { page, limit, totalItems } = pagination;
            const totalPages = Math.ceil(totalItems / limit);

            return new BaseResponse(true, message, {
                  items,
                  pagination: {
                        page,
                        limit,
                        totalItems,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                  }
            });
      }
}

module.exports = BaseResponse; 