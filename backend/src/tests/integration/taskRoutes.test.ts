import { FastifyInstance } from 'fastify';
import { buildApp } from '@/app';
import { prisma } from '../setup';

describe('Task Routes Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
  });

  describe('GET /api/tasks', () => {
    it('should return empty list when no tasks exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it('should return tasks with default pagination', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', description: 'Description 1' },
          { title: 'Task 2', description: 'Description 2' },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data).toHaveLength(2);
      expect(data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      });
    });

    it('should filter tasks by completed status', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Completed Task', completed: true },
          { title: 'Pending Task', completed: false },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks?completed=true',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].title).toBe('Completed Task');
      expect(data.data[0].completed).toBe(true);
    });

    it('should search tasks by title and description', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Important Task', description: 'This is important' },
          { title: 'Regular Task', description: 'This is regular' },
          { title: 'Another Task', description: 'Important details here' },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks?search=important',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data).toHaveLength(2);
    });

    it('should handle pagination correctly', async () => {
      const tasks = Array.from({ length: 15 }, (_, i) => ({
        title: `Task ${i + 1}`,
        description: `Description ${i + 1}`,
      }));
      
      await prisma.task.createMany({ data: tasks });

      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks?page=2&limit=5',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.data).toHaveLength(5);
      expect(data.pagination).toMatchObject({
        page: 2,
        limit: 5,
        total: 15,
        pages: 3,
      });
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task when found', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          description: 'Test Description',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/tasks/${task.id}`,
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.title).toBe('Test Task');
      expect(data.description).toBe('Test Description');
    });

    it('should return 404 when task not found', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks/550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.statusCode).toBe(404);
      const data = JSON.parse(response.payload);
      expect(data.message).toBe('Task not found');
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks/invalid-id',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create task with valid data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2024-12-31T23:59:59.000Z',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: taskData,
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.title).toBe(taskData.title);
      expect(data.description).toBe(taskData.description);
      expect(data.completed).toBe(false);
      expect(data.id).toBeDefined();
    });

    it('should create task with minimal data', async () => {
      const taskData = {
        title: 'Minimal Task',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: taskData,
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.title).toBe(taskData.title);
      expect(data.description).toBeNull();
      expect(data.dueDate).toBeNull();
    });

    it('should return 400 for missing title', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { description: 'No title provided' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for empty title', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { title: '' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task when found', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Original Task',
          description: 'Original Description',
          completed: false,
        },
      });

      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        completed: true,
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/tasks/${task.id}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.title).toBe(updateData.title);
      expect(data.description).toBe(updateData.description);
      expect(data.completed).toBe(updateData.completed);
    });

    it('should partially update task', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Original Task',
          description: 'Original Description',
          completed: false,
        },
      });

      const updateData = {
        completed: true,
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/tasks/${task.id}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.title).toBe('Original Task'); // unchanged
      expect(data.completed).toBe(true); // updated
    });

    it('should return 404 when task not found', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/tasks/550e8400-e29b-41d4-a716-446655440000',
        payload: { title: 'Updated Task' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task when found', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          description: 'This will be deleted',
        },
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/tasks/${task.id}`,
      });

      expect(response.statusCode).toBe(204);
      expect(response.payload).toBe('');

      // Verify task was deleted
      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deletedTask).toBeNull();
    });

    it('should return 404 when task not found', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/tasks/550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.status).toBe('OK');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('API Documentation', () => {
    it('should return swagger documentation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/documentation/json',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.info.title).toBe('Todo List API');
      expect(data.paths).toBeDefined();
      expect(data.paths['/api/tasks']).toBeDefined();
    });
  });
});