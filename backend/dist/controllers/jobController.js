"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const Job_1 = require("../models/Job");
class JobController {
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
            res.json({
                jobs,
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
            res.json({ job });
        }
        catch (error) {
            console.error('Get job error:', error);
            res.status(500).json({ error: 'Failed to fetch job' });
        }
    }
}
exports.JobController = JobController;
//# sourceMappingURL=jobController.js.map