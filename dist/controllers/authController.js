import { AuthService } from '../services/authService.js';
export class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, role } = req.body;
            const result = await AuthService.register(name, email, password, role);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            const result = await AuthService.verifyEmail(token);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.resendVerification(email);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.forgotPassword(email);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const result = await AuthService.resetPassword(token, newPassword);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=authController.js.map