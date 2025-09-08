import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/database/client';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskParams,
  TaskQuery,
  TaskResponse,
  TasksListResponse,
} from '@/schemas/taskSchemas';
import { Prisma } from '@prisma/client';

export class TaskController {
  async getAllTasks(
    request: FastifyRequest<{ Querystring: TaskQuery }>,
    reply: FastifyReply
  ): Promise<TasksListResponse> {
    try {
      const { completed, search, page, limit, sortBy, sortOrder } = request.query;

      const where: Prisma.TaskWhereInput = {};

      if (completed !== undefined) {
        where.completed = completed;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: Prisma.TaskOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      const skip = (page - 1) * limit;

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.task.count({ where }),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        data: tasks,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      };
    } catch (error) {
      request.log.error(error);
      reply.status(500);
      throw new Error('Internal server error');
    }
  }

  async getTaskById(
    request: FastifyRequest<{ Params: TaskParams }>,
    reply: FastifyReply
  ): Promise<TaskResponse> {
    try {
      const { id } = request.params;

      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        reply.status(404);
        throw new Error('Task not found');
      }

      return task;
    } catch (error) {
      request.log.error(error);
      if (reply.statusCode === 404) {
        throw error;
      }
      reply.status(500);
      throw new Error('Internal server error');
    }
  }

  async createTask(
    request: FastifyRequest<{ Body: CreateTaskInput }>,
    reply: FastifyReply
  ): Promise<TaskResponse> {
    try {
      const taskData = request.body;

      const task = await prisma.task.create({
        data: taskData,
      });

      reply.status(201);
      return task;
    } catch (error) {
      request.log.error(error);
      reply.status(500);
      throw new Error('Internal server error');
    }
  }

  async updateTask(
    request: FastifyRequest<{ Params: TaskParams; Body: UpdateTaskInput }>,
    reply: FastifyReply
  ): Promise<TaskResponse> {
    try {
      const { id } = request.params;
      const updateData = request.body;

      const existingTask = await prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        reply.status(404);
        throw new Error('Task not found');
      }

      const task = await prisma.task.update({
        where: { id },
        data: updateData,
      });

      return task;
    } catch (error) {
      request.log.error(error);
      if (reply.statusCode === 404) {
        throw error;
      }
      reply.status(500);
      throw new Error('Internal server error');
    }
  }

  async deleteTask(
    request: FastifyRequest<{ Params: TaskParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;

      const existingTask = await prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        reply.status(404);
        throw new Error('Task not found');
      }

      await prisma.task.delete({
        where: { id },
      });

      reply.status(204);
    } catch (error) {
      request.log.error(error);
      if (reply.statusCode === 404) {
        throw error;
      }
      reply.status(500);
      throw new Error('Internal server error');
    }
  }
}