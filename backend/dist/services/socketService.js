"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const queue_1 = require("../config/queue");
const Job_1 = require("../models/Job");
class SocketService {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });
        this.setupQueueListeners();
        this.setupSocketHandlers();
        // Set as singleton instance
        SocketService.instance = this;
    }
    static getInstance() {
        return SocketService.instance;
    }
    setupQueueListeners() {
        if (!queue_1.queueEvents) {
            console.warn('⚠️  Queue events not available - real-time updates disabled');
            return;
        }
        queue_1.queueEvents.on('waiting', async ({ jobId }) => {
            const userId = await this.getUserIdFromJobId(jobId);
            if (userId) {
                this.emitJobUpdate(jobId, userId, 'queued', 0);
            }
        });
        queue_1.queueEvents.on('active', async ({ jobId, prev }) => {
            const userId = await this.getUserIdFromJobId(jobId);
            if (userId) {
                this.emitJobUpdate(jobId, userId, 'processing', 10);
            }
        });
        queue_1.queueEvents.on('completed', async ({ jobId, returnvalue }) => {
            const userId = await this.getUserIdFromJobId(jobId);
            if (userId) {
                this.emitJobUpdate(jobId, userId, 'completed', 100, returnvalue);
            }
        });
        queue_1.queueEvents.on('failed', async ({ jobId, failedReason }) => {
            const userId = await this.getUserIdFromJobId(jobId);
            if (userId) {
                this.emitJobUpdate(jobId, userId, 'failed', 0, null, failedReason);
            }
        });
        queue_1.queueEvents.on('progress', async ({ jobId, data }) => {
            const userId = await this.getUserIdFromJobId(jobId);
            if (userId) {
                this.emitJobUpdate(jobId, userId, 'processing', typeof data === 'number' ? data : 50);
            }
        });
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on('join-user', (userId) => {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined room`);
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    async getUserIdFromJobId(jobId) {
        try {
            const job = await Job_1.Job.findById(jobId).select('userId');
            return job ? job.userId.toString() : null;
        }
        catch (error) {
            console.error('Error fetching userId from job:', error);
            return null;
        }
    }
    emitJobUpdate(jobId, userId, status, progress, result, error) {
        const update = {
            jobId,
            status,
            progress,
            result,
            error,
            timestamp: new Date().toISOString()
        };
        // Emit to specific user room
        this.io.to(`user_${userId}`).emit('job-update', update);
    }
    getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socketService.js.map