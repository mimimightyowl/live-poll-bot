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

      const assignValidated = (
        targetKey: 'params' | 'body' | 'query',
        value: any
      ) => {
        if (!value) {
          return;
        }

        try {
          (req as any)[targetKey] = value;
        } catch {
          const existing = (req as any)[targetKey];
          if (existing && typeof existing === 'object') {
            Object.assign(existing, value);
          }
        }
      };

      assignValidated('params', validateObject.params);
      assignValidated('body', validateObject.body);
      assignValidated('query', validateObject.query);

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
