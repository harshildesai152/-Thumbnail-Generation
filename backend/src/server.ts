import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { connectDB } from './config/database';
import redis from './config/redis';
import { queueReady } from './config/queue';
import { SocketService } from './services/socketService';
import thumbnailWorker from './workers/thumbnailWorker';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import jobRoutes from './routes/jobs';
import { StorageService } from './services/storageService';
import { errorHandler } from './middleware/errorHandler';

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Try to connect to Redis (optional for development)
    try {
      await redis.connect();
    } catch (redisError) {
      console.warn('⚠️  Redis connection failed. Server will start with limited functionality.');
      console.warn('💡 To enable queue processing, start Redis server.');
    }

    // Wait for queue initialization
    await queueReady;

    // Create Express app
    const app = express();

    // Security middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

    // Logging
    app.use(morgan('combined'));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Ensure upload directories exist
    StorageService.ensureDirectories();

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/jobs', jobRoutes);

    // Static file serving for uploads
    app.use('/api/files', express.static(StorageService.getUploadsDir()));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Error handling
    app.use(errorHandler);

    // Create HTTP server
    const server = createServer(app);

    // Initialize Socket.IO
    const socketService = new SocketService(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('📡 Socket.IO initialized');
      console.log('📋 API endpoints available at: http://localhost:' + PORT + '/api');
      console.log('🏥 Health check: http://localhost:' + PORT + '/api/health');

      if (thumbnailWorker) {
        console.log('👷 Thumbnail worker active');
      } else {
        console.log('⚠️  Thumbnail worker disabled (Redis not available)');
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(async () => {
        try {
          await redis.disconnect();
        } catch (e) {
          // Redis might not be connected
        }
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
