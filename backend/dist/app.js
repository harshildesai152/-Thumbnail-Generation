"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const storageService_1 = require("./services/storageService");
// Import routes - we'll need to refactor these first, but importing them here for structure
// import authRoutes from './routes/auth';
// import uploadRoutes from './routes/upload';
// import jobRoutes from './routes/jobs';
const app = async (fastify, opts) => {
    // Security headers
    await fastify.register(helmet_1.default);
    // CORS
    await fastify.register(cors_1.default, {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true
    });
    // Rate limiting
    await fastify.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '15 minutes'
    });
    // Body parsing and Multipart support
    // Fastify matches application/json by default
    await fastify.register(multipart_1.default);
    // Ensure upload directories exist
    storageService_1.StorageService.ensureDirectories();
    // Static file serving
    await fastify.register(static_1.default, {
        root: path_1.default.join(process.cwd(), 'uploads'),
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
exports.default = app;
//# sourceMappingURL=app.js.map