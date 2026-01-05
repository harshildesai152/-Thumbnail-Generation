"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
class AuthService {
    static generateTokens(user) {
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
        return { accessToken };
    }
    static async createUser(email, password, name) {
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const user = new User_1.User({ email, password, name });
        await user.save();
        return user;
    }
    static async authenticateUser(email, password) {
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        return user;
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map