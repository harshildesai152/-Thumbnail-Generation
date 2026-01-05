import { IUser } from '../models/User';
export interface AuthTokens {
    accessToken: string;
}
export declare class AuthService {
    static generateTokens(user: IUser): AuthTokens;
    static createUser(email: string, password: string, name: string): Promise<IUser>;
    static authenticateUser(email: string, password: string): Promise<IUser>;
    static verifyToken(token: string): {
        userId: string;
        email: string;
    };
}
//# sourceMappingURL=authService.d.ts.map