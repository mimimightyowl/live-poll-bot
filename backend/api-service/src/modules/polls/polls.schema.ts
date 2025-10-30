import { z } from 'zod';

export const createPollSchema = z.object({
  question: z
    .string()
    .min(1, 'Question cannot be empty')
    .max(255, 'Question must be at most 255 characters'),
  created_by: z.number().int().positive('Created by must be a positive number'),
});

export const updatePollSchema = z.object({
  question: z
    .string()
    .min(1, 'Question cannot be empty')
    .max(255, 'Question must be at most 255 characters')
    .optional(),
  created_by: z
    .number()
    .int()
    .positive('Created by must be a positive number')
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
export const patchPollSchema = updatePollSchema.partial();
