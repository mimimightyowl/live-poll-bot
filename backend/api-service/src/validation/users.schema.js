const { z } = require('zod');

// Схема для создания пользователя
const createUserSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string',
    })
    .min(1, 'Username cannot be empty')
    .max(50, 'Username must be at most 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers and underscores'
    ),

  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters'),

  full_name: z
    .string()
    .max(255, 'Full name must be at most 255 characters')
    .optional()
    .nullable(),

  telegram_id: z
    .string()
    .regex(/^\d+$/, 'Telegram ID must be numeric')
    .max(20, 'Telegram ID must be at most 20 characters')
    .optional()
    .nullable(),
});

// Схема для обновления пользователя
const updateUserSchema = z.object({
  username: z
    .string()
    .min(1, 'Username cannot be empty')
    .max(50, 'Username must be at most 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers and underscores'
    )
    .optional(),

  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .optional(),

  full_name: z
    .string()
    .max(255, 'Full name must be at most 255 characters')
    .optional()
    .nullable(),

  telegram_id: z
    .string()
    .regex(/^\d+$/, 'Telegram ID must be numeric')
    .max(20, 'Telegram ID must be at most 20 characters')
    .optional()
    .nullable(),
});

// Схема для валидации ID
const paramsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a positive number')
    .transform(val => parseInt(val, 10)),
});

// Схема для частичного обновления (все поля опциональны)
const patchUserSchema = updateUserSchema.partial();

module.exports = {
  createUserSchema,
  updateUserSchema,
  patchUserSchema,
  paramsSchema,
};
