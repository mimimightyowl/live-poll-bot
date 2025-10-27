const validate = schema => {
  return async (req, res, next) => {
    try {
      // Валидация может быть для body, params, query
      const validateObject = {};

      if (schema.params) {
        validateObject.params = await schema.params.parseAsync(req.params);
      }

      if (schema.body) {
        validateObject.body = await schema.body.parseAsync(req.body);
      }

      if (schema.query) {
        validateObject.query = await schema.query.parseAsync(req.query);
      }

      // Заменяем исходные данные на валидированные
      if (validateObject.params) {
        req.params = validateObject.params;
      }
      if (validateObject.body) {
        req.body = validateObject.body;
      }
      if (validateObject.query) {
        req.query = validateObject.query;
      }

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
};

module.exports = validate;
