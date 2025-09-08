import {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
  taskQuerySchema,
} from '@/schemas/taskSchemas';

describe('Task Schemas', () => {
  describe('createTaskSchema', () => {
    it('should validate valid task creation data', () => {
      const validData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date('2024-12-31'),
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal task creation data', () => {
      const validData = {
        title: 'Test Task',
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        description: 'Test Description',
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Title is required');
      }
    });

    it('should reject title longer than 255 characters', () => {
      const invalidData = {
        title: 'a'.repeat(256),
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Title must be less than 255 characters');
      }
    });

    it('should reject description longer than 1000 characters', () => {
      const invalidData = {
        title: 'Test Task',
        description: 'a'.repeat(1001),
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Description must be less than 1000 characters');
      }
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        title: 'Updated Task',
      };

      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate complete update data', () => {
      const validData = {
        title: 'Updated Task',
        description: 'Updated Description',
        completed: true,
        dueDate: new Date('2024-12-31'),
      };

      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate empty object', () => {
      const result = updateTaskSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject empty title when provided', () => {
      const invalidData = {
        title: '',
      };

      const result = updateTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('taskParamsSchema', () => {
    it('should validate valid UUID', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = taskParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalidData = {
        id: 'invalid-uuid',
      };

      const result = taskParamsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid task ID format');
      }
    });
  });

  describe('taskQuerySchema', () => {
    it('should validate with default values', () => {
      const result = taskQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe('createdAt');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('should validate with custom values', () => {
      const validData = {
        completed: 'true',
        search: 'test',
        page: '2',
        limit: '20',
        sortBy: 'title',
        sortOrder: 'asc',
      };

      const result = taskQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completed).toBe(true);
        expect(result.data.search).toBe('test');
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('title');
        expect(result.data.sortOrder).toBe('asc');
      }
    });

    it('should reject invalid sortBy value', () => {
      const invalidData = {
        sortBy: 'invalid',
      };

      const result = taskQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject limit over 100', () => {
      const invalidData = {
        limit: '101',
      };

      const result = taskQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});