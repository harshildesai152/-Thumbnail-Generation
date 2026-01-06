"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const database_1 = require("./config/database");
const redis_1 = __importDefault(require("./config/redis"));
const queue_1 = require("./config/queue");
const socketService_1 = require("./services/socketService");
const thumbnailWorker_1 = require("./workers/thumbnailWorker");
const auth_1 = __importDefault(require("./routes/auth"));
const upload_1 = __importDefault(require("./routes/upload"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const storageService_1 = require("./services/storageService");
const errorHandler_1 = require("./middleware/errorHandler");
const PORT = process.env.PORT || 3003;
async function startServer() {
    try {
        // Connect to MongoDB
        await (0, database_1.connectDB)();
        // Try to connect to Redis (optional for development)
        try {
            await redis_1.default.connect();
        }
        catch (redisError) {
            console.warn('⚠️  Redis connection failed. Server will start with limited functionality.');
            console.warn('💡 To enable queue processing, start Redis server.');
        }
        // Wait for queue initialization
        await queue_1.queueReady;
        // Create Express app
        const app = (0, express_1.default)();
        // Security middleware
        app.use((0, helmet_1.default)());
        app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        app.use(limiter);
        // Logging
        app.use((0, morgan_1.default)('combined'));
        // Body parsing
        app.use(express_1.default.json({ limit: '10mb' }));
        app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Ensure upload directories exist
        storageService_1.StorageService.ensureDirectories();
        // Routes
        app.use('/api/auth', auth_1.default);
        app.use('/api/upload', upload_1.default);
        app.use('/api/jobs', jobs_1.default);
        // Static file serving for uploads
        app.use('/api/files', express_1.default.static(storageService_1.StorageService.getUploadsDir()));
        // Health check
        app.get('/api/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
        // Error handling
        app.use(errorHandler_1.errorHandler);
        // Create HTTP server
        const server = (0, http_1.createServer)(app);
        // Initialize Socket.IO FIRST
        const socketService = new socketService_1.SocketService(server);
        console.log('📡 Socket.IO service initialized');
        // Initialize Worker AFTER SocketService is ready
        const thumbnailWorker = (0, thumbnailWorker_1.initThumbnailWorker)();
        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log('📡 Socket.IO initialized and listening');
            console.log('📋 API endpoints available at: http://localhost:' + PORT + '/api');
            console.log('🏥 Health check: http://localhost:' + PORT + '/api/health');
            if (thumbnailWorker) {
                console.log('👷 Thumbnail worker active');
            }
            else {
                console.log('⚠️  Thumbnail worker disabled (Redis not available)');
            }
        });
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('🛑 SIGTERM received, shutting down gracefully');
            server.close(async () => {
                try {
                    await redis_1.default.disconnect();
                }
                catch (e) {
                    // Redis might not be connected
                }
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map