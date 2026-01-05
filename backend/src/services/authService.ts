import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthTokens {
  accessToken: string;
}

export class AuthService {
  static generateTokens(user: IUser): AuthTokens {
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );

    return { accessToken };
  }

  static async createUser(email: string, password: string, name: string): Promise<IUser> {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const user = new User({ email, password, name });
    await user.save();
    return user;
  }

  static async authenticateUser(email: string, password: string): Promise<IUser> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  static verifyToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
