import { z } from 'zod';

export const createVoteSchema = z.object({
  poll_option_id: z
    .number()
    .int()
    .positive('Poll option ID must be a positive number'),
  user_id: z.number().int().positive('User ID must be a positive number'),
});

export const updateVoteSchema = z.object({
  poll_option_id: z
    .number()
    .int()
    .positive('Poll option ID must be a positive number')
    .optional(),
  user_id: z
    .number()
    .int()
    .positive('User ID must be a positive number')
    .optional(),
});

// Schema for validating ID
export const paramsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a positive number')
    .transform(val => parseInt(val, 10)),
});

// Schema for partial update (all fields optional)
export const patchVoteSchema = updateVoteSchema.partial();
