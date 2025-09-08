import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  completed: z.boolean().optional(),
  dueDate: z.coerce.date().optional(),
});

export const taskParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
});

export const taskQuerySchema = z.object({
  completed: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  dueDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const tasksListResponseSchema = z.object({
  data: z.array(taskResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

// Convert Zod schemas to JSON Schema format for Fastify
export const createTaskJsonSchema = zodToJsonSchema(createTaskSchema);
export const updateTaskJsonSchema = zodToJsonSchema(updateTaskSchema);
export const taskParamsJsonSchema = zodToJsonSchema(taskParamsSchema);
export const taskQueryJsonSchema = zodToJsonSchema(taskQuerySchema);
export const taskResponseJsonSchema = zodToJsonSchema(taskResponseSchema);
export const tasksListResponseJsonSchema = zodToJsonSchema(tasksListResponseSchema);
export const errorResponseJsonSchema = zodToJsonSchema(errorResponseSchema);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TasksListResponse = z.infer<typeof tasksListResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;