import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File too large' });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({ error: 'Too many files' });
      return;
    }
  }

  if (error.message === 'Invalid file type') {
    res.status(400).json({ error: 'Invalid file type' });
    return;
  }

  next(error);
};
