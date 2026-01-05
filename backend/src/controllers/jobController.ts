import { Request, Response } from 'express';
import { Job } from '../models/Job';

export class JobController {
  static async getUserJobs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const jobs = await Job.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Job.countDocuments({ userId });

      res.json({
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  }

  static async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = req.user!.userId;

      const job = await Job.findOne({ _id: jobId, userId });
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      res.json({ job });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  }
}
