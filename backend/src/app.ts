import fastify, { FastifyInstance } from 'fastify';
import { taskRoutes } from '@/routes/taskRoutes';
import dotenv from 'dotenv';

dotenv.config();

const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    },
  });

  // Register CORS
  await app.register(import('@fastify/cors'), {
    origin: process.env.NODE_ENV === 'development' ? true : ['http://localhost:3000'],
    credentials: true,
  });

  // Register Swagger for API documentation
  await app.register(import('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Todo List API',
        description: 'A complete CRUD API for managing todo tasks',
        version: '1.0.0',
      },
      host: 'localhost:3001',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        {
          name: 'tasks',
          description: 'Task management endpoints',
        },
      ],
    },
  });

  // Register Swagger UI
  await app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next(); },
      preHandler: function (request, reply, next) { next(); },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  
  app.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

    // Register task routes with prefix /api
  await app.register(taskRoutes, { prefix: '/api' });

    // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    
    const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500;
    
    reply.status(statusCode).send({
      error: error.name || 'Error',
      message: error.message || 'Internal Server Error',
      statusCode,
    });
  });
    // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404,
    });
  });

  return app;
};

const start = async () => {
  try {
    const app = await buildApp();
    const port = Number(process.env.PORT) || 3001;
    
    await app.listen({ port, host: '0.0.0.0' });
    
    console.log(` Server running at http://localhost:${port}`);
    console.log(` API Documentation available at http://localhost:${port}/documentation`);
  } catch (error) {
    console.error(' Error starting server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

export { buildApp };