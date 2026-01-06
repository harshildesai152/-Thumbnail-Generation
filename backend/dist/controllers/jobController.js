"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const path_1 = __importDefault(require("path"));
const Job_1 = require("../models/Job");
const storageService_1 = require("../services/storageService");
class JobController {
    static serializeJob(job, req) {
        const jobObj = job.toObject();
        if (jobObj.status === 'completed' && jobObj.thumbnailFilePath) {
            // Extract filename from the path
            const thumbnailFileName = path_1.default.basename(jobObj.thumbnailFilePath);
            // Use relative URL - let the frontend proxy handle the domain
            jobObj.thumbnailUrl = `/api/files/thumbnails/${thumbnailFileName}`;
            console.log('Generated thumbnail URL:', jobObj.thumbnailUrl);
        }
        return jobObj;
    }
    static async getUserJobs(req, res) {
        try {
            const userId = req.user.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const jobs = await Job_1.Job.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v');
            const total = await Job_1.Job.countDocuments({ userId });
            // Serialize jobs to include URL
            const serializedJobs = jobs.map(job => JobController.serializeJob(job, req));
            res.json({
                jobs: serializedJobs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            console.error('Get jobs error:', error);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    }
    static async getJobById(req, res) {
        try {
            const { jobId } = req.params;
            const userId = req.user.userId;
            const job = await Job_1.Job.findOne({ _id: jobId, userId });
            if (!job) {
                res.status(404).json({ error: 'Job not found' });
                return;
            }
            res.json({ job: JobController.serializeJob(job, req) });
        }
        catch (error) {
            console.error('Get job error:', error);
            res.status(500).json({ error: 'Failed to fetch job' });
        }
    }
    static async deleteJob(req, res) {
        try {
            const { jobId } = req.params;
            const userId = req.user.userId;
            const job = await Job_1.Job.findOne({ _id: jobId, userId });
            if (!job) {
                res.status(404).json({ error: 'Job not found' });
                return;
            }
            // Delete files
            if (job.originalFilePath) {
                await storageService_1.StorageService.deleteFile(job.originalFilePath);
            }
            if (job.thumbnailFilePath) {
                await storageService_1.StorageService.deleteFile(job.thumbnailFilePath);
            }
            // Delete database record
            await Job_1.Job.deleteOne({ _id: jobId });
            res.json({ message: 'Job deleted successfully' });
        }
        catch (error) {
            console.error('Delete job error:', error);
            res.status(500).json({ error: 'Failed to delete job' });
        }
    }
}
exports.JobController = JobController;
//# sourceMappingURL=jobController.js.map