import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
export declare class SocketService {
    private io;
    private static instance;
    constructor(server: HttpServer);
    static getInstance(): SocketService | null;
    private setupQueueListeners;
    private setupSocketHandlers;
    private getUserIdFromJobId;
    private getBullMQJobData;
    emitJobUpdate(jobId: string, userId: string, status: string, progress: number, result?: any, error?: string): void;
    getIO(): SocketServer;
}
//# sourceMappingURL=socketService.d.ts.map