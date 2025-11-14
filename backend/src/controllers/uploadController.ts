import { Request, Response } from 'express';

export class UploadController {
  async uploadAudio(req: Request, res: Response) {
    res.status(501).json({ message: 'Upload controller not implemented yet' });
  }

  async uploadMultipleAudio(req: Request, res: Response) {
    res.status(501).json({ message: 'Upload controller not implemented yet' });
  }

  async uploadImage(req: Request, res: Response) {
    res.status(501).json({ message: 'Upload controller not implemented yet' });
  }

  async getUploadStatus(req: Request, res: Response) {
    res.status(501).json({ message: 'Upload controller not implemented yet' });
  }

  async deleteFile(req: Request, res: Response) {
    res.status(501).json({ message: 'Upload controller not implemented yet' });
  }
}
