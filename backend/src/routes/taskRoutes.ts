import { FastifyInstance } from 'fastify';
import { TaskController } from '@/controllers/TaskController';
import {
  createTaskJsonSchema,
  updateTaskJsonSchema,
  taskParamsJsonSchema,
  taskQueryJsonSchema,
  taskResponseJsonSchema,
  tasksListResponseJsonSchema,
  errorResponseJsonSchema,
} from '@/schemas/taskSchemas';

export async function taskRoutes(fastify: FastifyInstance) {
  const taskController = new TaskController();

  // Get all tasks
  fastify.get('/tasks', {
    schema: {
      description: 'Get all tasks with optional filtering and pagination',
      tags: ['tasks'],
      querystring: taskQueryJsonSchema,
      response: {
        200: tasksListResponseJsonSchema,
        500: errorResponseJsonSchema,
      },
    },
    handler: taskController.getAllTasks.bind(taskController),
  });

  // Get task by ID
  fastify.get('/tasks/:id', {
    schema: {
      description: 'Get a specific task by ID',
      tags: ['tasks'],
      params: taskParamsJsonSchema,
      response: {
        200: taskResponseJsonSchema,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema,
      },
    },
    handler: taskController.getTaskById.bind(taskController),
  });

  // Create new task
  fastify.post('/tasks', {
    schema: {
      description: 'Create a new task',
      tags: ['tasks'],
      body: createTaskJsonSchema,
      response: {
        201: taskResponseJsonSchema,
        400: errorResponseJsonSchema,
        500: errorResponseJsonSchema,
      },
    },
    handler: taskController.createTask.bind(taskController),
  });

  // Update task
  fastify.patch('/tasks/:id', {
    schema: {
      description: 'Update an existing task',
      tags: ['tasks'],
      params: taskParamsJsonSchema,
      body: updateTaskJsonSchema,
      response: {
        200: taskResponseJsonSchema,
        400: errorResponseJsonSchema,
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema,
      },
    },
    handler: taskController.updateTask.bind(taskController),
  });

  // Delete task
  fastify.delete('/tasks/:id', {
    schema: {
      description: 'Delete a task',
      tags: ['tasks'],
      params: taskParamsJsonSchema,
      response: {
        204: {
          type: 'null',
          description: 'Task deleted successfully',
        },
        404: errorResponseJsonSchema,
        500: errorResponseJsonSchema,
      },
    },
    handler: taskController.deleteTask.bind(taskController),
  });
}