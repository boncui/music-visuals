import { Request, Response } from 'express';

export class AuthController {
  async register(req: Request, res: Response) {
    res.status(501).json({ message: 'Auth controller not implemented yet' });
  }

  async login(req: Request, res: Response) {
    res.status(501).json({ message: 'Auth controller not implemented yet' });
  }

  async refreshToken(req: Request, res: Response) {
    res.status(501).json({ message: 'Auth controller not implemented yet' });
  }

  async logout(req: Request, res: Response) {
    res.status(501).json({ message: 'Auth controller not implemented yet' });
  }

  async forgotPassword(req: Request, res: Response) {
    res.status(501).json({ message: 'Auth controller not implemented yet' });
  }

  async resetPassword(req: Request, res: Response) {
    res.status(501).json({ message: 'Auth controller not implemented yet' });
  }
}
