import { Request, Response } from 'express';
import path from 'path';
import { Job } from '../models/Job';

export class JobController {
  private static serializeJob(job: any, req: Request) {
    const jobObj = job.toObject();
    
    if (jobObj.status === 'completed' && jobObj.thumbnailFilePath) {
      // Extract filename from the path
      const thumbnailFileName = path.basename(jobObj.thumbnailFilePath);
      // Use relative URL - let the frontend proxy handle the domain
      jobObj.thumbnailUrl = `/api/files/thumbnails/${thumbnailFileName}`;
      console.log('Generated thumbnail URL:', jobObj.thumbnailUrl);
    }
    
    return jobObj;
  }

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

      res.json({ job: JobController.serializeJob(job, req) });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  }
}
