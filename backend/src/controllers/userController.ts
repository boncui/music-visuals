import { Request, Response } from 'express';

export class UserController {
  async getProfile(req: Request, res: Response) {
    res.status(501).json({ message: 'User controller not implemented yet' });
  }

  async updateProfile(req: Request, res: Response) {
    res.status(501).json({ message: 'User controller not implemented yet' });
  }

  async getUserSongs(req: Request, res: Response) {
    res.status(501).json({ message: 'User controller not implemented yet' });
  }

  async getUserPresets(req: Request, res: Response) {
    res.status(501).json({ message: 'User controller not implemented yet' });
  }

  async getUserStats(req: Request, res: Response) {
    res.status(501).json({ message: 'User controller not implemented yet' });
  }
}
