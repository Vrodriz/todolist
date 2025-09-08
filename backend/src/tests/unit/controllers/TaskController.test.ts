import { TaskController } from '@/controllers/TaskController';
import { prisma } from '../../../tests/setup';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('@/database/client', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('TaskController', () => {
  let taskController: TaskController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    taskController = new TaskController();
    mockRequest = {
      log: { error: jest.fn() },
      query: {},
      params: {},
      body: {},
    } as any;
    mockReply = {
      status: jest.fn().mockReturnThis(),
      statusCode: 200,
    } as any;

    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should return tasks with pagination', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: null,
          completed: false,
          dueDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);
      mockPrisma.task.count.mockResolvedValue(1);

      mockRequest.query = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };

      const result = await taskController.getAllTasks(
        mockRequest as FastifyRequest<{ Querystring: any }>,
        mockReply as FastifyReply
      );

      expect(result.data).toEqual(mockTasks);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      });
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should filter tasks by completion status', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      mockRequest.query = { completed: true, page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };

      await taskController.getAllTasks(
        mockRequest as FastifyRequest<{ Querystring: any }>,
        mockReply as FastifyReply
      );

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { completed: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should handle search query', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      mockRequest.query = { search: 'test', page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };

      await taskController.getAllTasks(
        mockRequest as FastifyRequest<{ Querystring: any }>,
        mockReply as FastifyReply
      );

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getTaskById', () => {
    it('should return task when found', async () => {
      const mockTask = {
        id: '1',
        title: 'Task 1',
        description: null,
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockRequest.params = { id: '1' };

      const result = await taskController.getTaskById(
        mockRequest as FastifyRequest<{ Params: any }>,
        mockReply as FastifyReply
      );

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw error when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);
      mockRequest.params = { id: '1' };

      await expect(
        taskController.getTaskById(
          mockRequest as FastifyRequest<{ Params: any }>,
          mockReply as FastifyReply
        )
      ).rejects.toThrow('Task not found');

      expect(mockReply.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createTask', () => {
    it('should create and return new task', async () => {
      const mockTask = {
        id: '1',
        title: 'New Task',
        description: 'Task description',
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.task.create.mockResolvedValue(mockTask);
      mockRequest.body = { title: 'New Task', description: 'Task description' };

      const result = await taskController.createTask(
        mockRequest as FastifyRequest<{ Body: any }>,
        mockReply as FastifyReply
      );

      expect(result).toEqual(mockTask);
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: { title: 'New Task', description: 'Task description' },
      });
    });
  });

  describe('updateTask', () => {
    it('should update and return task when found', async () => {
      const existingTask = {
        id: '1',
        title: 'Old Task',
        description: null,
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = { ...existingTask, title: 'Updated Task' };

      mockPrisma.task.findUnique.mockResolvedValue(existingTask);
      mockPrisma.task.update.mockResolvedValue(updatedTask);

      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Task' };

      const result = await taskController.updateTask(
        mockRequest as FastifyRequest<{ Params: any; Body: any }>,
        mockReply as FastifyReply
      );

      expect(result).toEqual(updatedTask);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'Updated Task' },
      });
    });

    it('should throw error when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Task' };

      await expect(
        taskController.updateTask(
          mockRequest as FastifyRequest<{ Params: any; Body: any }>,
          mockReply as FastifyReply
        )
      ).rejects.toThrow('Task not found');

      expect(mockReply.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTask', () => {
    it('should delete task when found', async () => {
      const existingTask = {
        id: '1',
        title: 'Task to delete',
        description: null,
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.task.findUnique.mockResolvedValue(existingTask);
      mockPrisma.task.delete.mockResolvedValue(existingTask);

      mockRequest.params = { id: '1' };

      await taskController.deleteTask(
        mockRequest as FastifyRequest<{ Params: any }>,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw error when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);
      mockRequest.params = { id: '1' };

      await expect(
        taskController.deleteTask(
          mockRequest as FastifyRequest<{ Params: any }>,
          mockReply as FastifyReply
        )
      ).rejects.toThrow('Task not found');

      expect(mockReply.status).toHaveBeenCalledWith(404);
    });
  });
});