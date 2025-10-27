import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

interface ValidationSchema {
  params?: ZodSchema<any>;
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
}

const validate = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Валидация может быть для body, params, query
      const validateObject: any = {};

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
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as any;
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: zodError.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      next(error);
    }
  };
};

export default validate;
