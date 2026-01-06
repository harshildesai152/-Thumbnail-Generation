import { Queue, Worker, QueueEvents } from 'bullmq';
declare let thumbnailQueue: Queue | null;
declare let queueEvents: QueueEvents | null;
export { thumbnailQueue, queueEvents, Worker };
export declare const getQueueEvents: () => QueueEvents | null;
export declare const queueReady: Promise<void>;
export declare const isQueueAvailable: () => boolean;
//# sourceMappingURL=queue.d.ts.map