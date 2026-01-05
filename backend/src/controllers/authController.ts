import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { User } from '../models/User';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const user = await AuthService.createUser(email, password, name);
      const tokens = AuthService.generateTokens(user);

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        tokens
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await AuthService.authenticateUser(email, password);
      const tokens = AuthService.generateTokens(user);

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        tokens
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: (error as Error).message });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user?.userId).select('-password');
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
