import mongoose, { Document } from 'mongoose';
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
export interface IJob extends Document {
    userId: mongoose.Types.ObjectId;
    originalFileName: string;
    originalFilePath: string;
    thumbnailFileName?: string;
    thumbnailFilePath?: string;
    fileType: 'image' | 'video';
    status: JobStatus;
    progress: number;
    errorMessage?: string;
    createdAt: Date;
    completedAt?: Date;
}
export declare const Job: mongoose.Model<IJob, {}, {}, {}, mongoose.Document<unknown, {}, IJob, {}, {}> & IJob & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Job.d.ts.map