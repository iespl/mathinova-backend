import { AdminService } from '../services/adminService.js';
import cache from '../utils/cache.js';
export class AdminController {
    static async processRefund(req, res) {
        try {
            const adminId = req.user.id;
            const paymentId = req.params.payment_id;
            const { reason } = req.body;
            if (!reason)
                return res.status(400).json({ message: 'Refund reason is required' });
            const result = await AdminService.refundPayment(adminId, paymentId, reason);
            res.json({ message: 'Refund processed successfully', ...result });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getAllOrders(req, res) {
        try {
            const orders = await AdminService.getOrders();
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // --- Users ---
    static async getUsers(req, res) {
        try {
            const users = await AdminService.getUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async toggleUserStatus(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id;
            const { isActive } = req.body; // Expect boolean
            if (typeof isActive !== 'boolean') {
                return res.status(400).json({ message: 'isActive must be a boolean' });
            }
            const user = await AdminService.toggleUserStatus(adminId, id, isActive);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // --- Courses ---
    static async listCourses(req, res) {
        try {
            const courses = await AdminService.listCourses();
            res.json(courses);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async createCourse(req, res) {
        try {
            const adminId = req.user.id;
            const course = await AdminService.createCourse(adminId, req.body);
            res.status(201).json(course);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateCourse(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id;
            const course = await AdminService.updateCourse(adminId, id, req.body);
            // Invalidate public cache so next page load gets fresh data
            if (course?.slug) {
                cache.invalidate(`public:course:${course.slug}`);
            }
            res.json(course);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteCourse(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id;
            await AdminService.deleteCourse(adminId, id);
            res.json({ message: 'Course deleted successfully' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getCourse(req, res) {
        try {
            const id = req.params.id;
            const course = await AdminService.getCourseById(id);
            if (!course)
                return res.status(404).json({ message: 'Course not found' });
            res.json(course);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // --- Content ---
    static async addModule(req, res) {
        try {
            const id = req.params.id; // courseId
            const { title, order } = req.body;
            const module = await AdminService.addModule(id, title, order);
            res.status(201).json(module);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateModule(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id; // moduleId
            const module = await AdminService.updateModule(adminId, id, req.body);
            res.json(module);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteModule(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id; // moduleId
            await AdminService.deleteModule(adminId, id);
            res.json({ message: 'Module deleted successfully' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async addLesson(req, res) {
        try {
            const id = req.params.id; // moduleId
            const { title, order } = req.body;
            const lesson = await AdminService.addLesson(id, title, order);
            res.status(201).json(lesson);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateLesson(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id; // lessonId
            const lesson = await AdminService.updateLesson(adminId, id, req.body);
            res.json(lesson);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateLessonContent(req, res) {
        try {
            const id = req.params.id; // lessonId
            const { videos, pyqs, quiz } = req.body;
            const result = await AdminService.updateLessonContent(id, videos, pyqs, quiz);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteLesson(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id; // lessonId
            await AdminService.deleteLesson(adminId, id);
            res.json({ message: 'Lesson deleted successfully' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // --- Reordering ---
    static async reorderModules(req, res) {
        try {
            const adminId = req.user.id;
            const { moduleIdOrders } = req.body;
            if (!Array.isArray(moduleIdOrders))
                return res.status(400).json({ message: 'moduleIdOrders array is required' });
            const result = await AdminService.reorderModules(adminId, moduleIdOrders);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async reorderLessons(req, res) {
        try {
            const adminId = req.user.id;
            const { lessonIdOrders } = req.body;
            if (!Array.isArray(lessonIdOrders))
                return res.status(400).json({ message: 'lessonIdOrders array is required' });
            const result = await AdminService.reorderLessons(adminId, lessonIdOrders);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async reorderVideos(req, res) {
        try {
            const adminId = req.user.id;
            const { videoIdOrders } = req.body;
            if (!Array.isArray(videoIdOrders))
                return res.status(400).json({ message: 'videoIdOrders array is required' });
            const result = await AdminService.reorderVideos(adminId, videoIdOrders);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async reorderPYQs(req, res) {
        try {
            const adminId = req.user.id;
            const { pyqIdOrders } = req.body;
            if (!Array.isArray(pyqIdOrders))
                return res.status(400).json({ message: 'pyqIdOrders array is required' });
            const result = await AdminService.reorderPYQs(adminId, pyqIdOrders);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async reorderQuizQuestions(req, res) {
        try {
            const adminId = req.user.id;
            const { questionIdOrders } = req.body;
            if (!Array.isArray(questionIdOrders))
                return res.status(400).json({ message: 'questionIdOrders array is required' });
            const result = await AdminService.reorderQuizQuestions(adminId, questionIdOrders);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // --- Branch Management ---
    static async listBranches(req, res) {
        try {
            const branches = await AdminService.listBranches();
            res.json(branches);
        }
        catch (error) {
            console.error('[AdminController.listBranches] Error:', error);
            res.status(500).json({ message: error.message });
        }
    }
    static async createBranch(req, res) {
        try {
            const adminId = req.user.id;
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ message: 'Branch name is required' });
            const branch = await AdminService.createBranch(adminId, name);
            res.status(201).json(branch);
        }
        catch (error) {
            console.error('[AdminController.createBranch] Error:', error);
            res.status(500).json({ message: error.message });
        }
    }
    static async updateBranch(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id;
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ message: 'Branch name is required' });
            const branch = await AdminService.updateBranch(adminId, id, name);
            res.json(branch);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteBranch(req, res) {
        try {
            const adminId = req.user.id;
            const id = req.params.id;
            await AdminService.deleteBranch(adminId, id);
            res.json({ message: 'Branch deleted successfully' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=adminController.js.map