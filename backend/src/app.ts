import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import path from 'path';
import { StorageService } from './services/storageService';
// Import routes - we'll need to refactor these first, but importing them here for structure
// import authRoutes from './routes/auth';
// import uploadRoutes from './routes/upload';
// import jobRoutes from './routes/jobs';

const app: FastifyPluginAsync = async (fastify, opts) => {
  // Security headers
  await fastify.register(helmet);

  // CORS
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  });

  // Body parsing and Multipart support
  // Fastify matches application/json by default
  await fastify.register(multipart);

  // Ensure upload directories exist
  StorageService.ensureDirectories();

  // Static file serving
  await fastify.register(staticPlugin, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/api/files/',
  });

  // Health check
  fastify.get('/api/health', async (request, reply) => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  // Register routes (We will need to convert these to Fastify plugins next)
  // await fastify.register(authRoutes, { prefix: '/api/auth' });
  // await fastify.register(uploadRoutes, { prefix: '/api/upload' });
  // await fastify.register(jobRoutes, { prefix: '/api/jobs' });
  
  // Temporary placeholder until routes are converted
  fastify.log.info('Routes registration commented out until conversion');
};

export default app;
