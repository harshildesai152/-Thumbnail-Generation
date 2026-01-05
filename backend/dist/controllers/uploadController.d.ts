import { Request, Response } from 'express';
export declare class UploadController {
    static uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static uploadFiles(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=uploadController.d.ts.map