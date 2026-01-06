"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
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
        if (!SocketService.instance) {
            console.warn('⚠️  SocketService.getInstance() called but instance is null');
        }
        return SocketService.instance;
    }
    setupQueueListeners() {
        // Import queue events dynamically to avoid circular dependencies
        Promise.resolve().then(() => __importStar(require('../config/queue'))).then(({ getQueueEvents }) => {
            const checkAndSetup = () => {
                console.log('🔍 Checking for QueueEvents...');
                const events = getQueueEvents();
                if (!events) {
                    console.warn('⚠️  Queue events not available - real-time updates disabled. Retrying in 2s...');
                    // Try again in 2 seconds
                    setTimeout(checkAndSetup, 2000);
                    return;
                }
                console.log('✅ Queue events listener attached successfully');
                console.log('🔧 QueueEvents object:', typeof events, events?.constructor?.name);
                events.on('waiting', async ({ jobId }) => {
                    console.log(`📋 DEBUG: BullMQ Job ${jobId} waiting/queued event received`);
                    try {
                        // Get job data from BullMQ to extract MongoDB jobId and userId
                        const jobData = await this.getBullMQJobData(jobId);
                        if (jobData) {
                            this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'queued', 0);
                        }
                        else {
                            console.warn(`⚠️ DEBUG: BullMQ Job ${jobId} waiting - Job data not found`);
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error processing waiting event for job ${jobId}:`, error);
                    }
                });
                events.on('active', async ({ jobId, prev }) => {
                    console.log(`⚙️  DEBUG: BullMQ Job ${jobId} active/processing event received`);
                    try {
                        // Get job data from BullMQ to extract MongoDB jobId and userId
                        const jobData = await this.getBullMQJobData(jobId);
                        if (jobData) {
                            this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'processing', 10);
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error processing active event for job ${jobId}:`, error);
                    }
                });
                events.on('completed', async ({ jobId, returnvalue }) => {
                    console.log(`✅ DEBUG: BullMQ Job ${jobId} completed event received`);
                    try {
                        const jobData = await this.getBullMQJobData(jobId);
                        if (jobData) {
                            console.log(`✅ DEBUG: Emitting completed for user ${jobData.userId}`);
                            this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'completed', 100, returnvalue);
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error processing completed event for job ${jobId}:`, error);
                    }
                });
                events.on('failed', async ({ jobId, failedReason }) => {
                    console.log(`❌ DEBUG: BullMQ Job ${jobId} failed event received: ${failedReason}`);
                    try {
                        const jobData = await this.getBullMQJobData(jobId);
                        if (jobData) {
                            this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'failed', 0, null, failedReason);
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error processing failed event for job ${jobId}:`, error);
                    }
                });
                events.on('progress', async ({ jobId, data }) => {
                    console.log(`📊 DEBUG: BullMQ Job ${jobId} progress event received: ${data}`);
                    try {
                        const jobData = await this.getBullMQJobData(jobId);
                        if (jobData) {
                            this.emitJobUpdate(jobData.mongoJobId, jobData.userId, 'processing', typeof data === 'number' ? data : 50);
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error processing progress event for job ${jobId}:`, error);
                    }
                });
            };
            // Start checking immediately
            checkAndSetup();
        }).catch(error => {
            console.error('❌ Failed to setup queue listeners:', error);
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
    async getBullMQJobData(bullMQJobId) {
        try {
            // Import queue to get job data
            const { thumbnailQueue } = await Promise.resolve().then(() => __importStar(require('../config/queue')));
            if (!thumbnailQueue) {
                console.error('❌ Queue not available for getting job data');
                return null;
            }
            // Get the BullMQ job
            const job = await thumbnailQueue.getJob(bullMQJobId);
            if (!job || !job.data) {
                console.error(`❌ BullMQ job ${bullMQJobId} not found or has no data`);
                return null;
            }
            const { jobId: mongoJobId, userId } = job.data;
            if (!mongoJobId || !userId) {
                console.error(`❌ BullMQ job ${bullMQJobId} missing mongoJobId or userId in data:`, job.data);
                return null;
            }
            return { mongoJobId, userId };
        }
        catch (error) {
            console.error(`❌ Error getting BullMQ job data for job ${bullMQJobId}:`, error);
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
        console.log(`🔄 SOCKET EMIT: Job ${jobId} -> ${status} (${progress}%) to user_${userId}`);
        console.log(`🔄 Connected sockets:`, this.io.sockets.sockets.size);
        console.log(`🔄 Rooms for user_${userId}:`, this.io.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0);
        this.io.to(`user_${userId}`).emit('job-update', update);
    }
    getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socketService.js.map