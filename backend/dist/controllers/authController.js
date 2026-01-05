"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const User_1 = require("../models/User");
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, name } = req.body;
            if (!email || !password || !name) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }
            const user = await authService_1.AuthService.createUser(email, password, name);
            const tokens = authService_1.AuthService.generateTokens(user);
            res.status(201).json({
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                },
                tokens
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({ error: error.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const user = await authService_1.AuthService.authenticateUser(email, password);
            const tokens = authService_1.AuthService.generateTokens(user);
            res.json({
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                },
                tokens
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message });
        }
    }
    static async getProfile(req, res) {
        try {
            const user = await User_1.User.findById(req.user?.userId).select('-password');
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ user });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map