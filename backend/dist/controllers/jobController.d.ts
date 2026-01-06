import { Request, Response } from 'express';
export declare class JobController {
    private static serializeJob;
    static getUserJobs(req: Request, res: Response): Promise<void>;
    static getJobById(req: Request, res: Response): Promise<void>;
    static deleteJob(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=jobController.d.ts.map