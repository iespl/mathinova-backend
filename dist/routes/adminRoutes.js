import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { Role } from '@prisma/client';
const router = Router();
router.use(authenticate);
router.use(authorize([Role.admin, Role.super_admin]));
router.post('/refunds/:payment_id', AdminController.processRefund);
// Users
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
// Courses
router.get('/courses', AdminController.listCourses);
router.post('/courses', AdminController.createCourse);
router.get('/courses/:id', AdminController.getCourse);
router.get('/courses/:id/basic', AdminController.getCourseBasic);
router.put('/courses/:id', AdminController.updateCourse);
router.delete('/courses/:id', AdminController.deleteCourse);
// Content Structure
router.post('/courses/:id/modules', AdminController.addModule);
router.patch('/modules/:id', AdminController.updateModule);
router.delete('/modules/:id', AdminController.deleteModule);
router.post('/modules/:id/lessons', AdminController.addLesson);
router.post('/modules/:id/clone', AdminController.cloneModule);
router.patch('/lessons/:id', AdminController.updateLesson);
router.get('/lessons/:id/details', AdminController.getLessonDetails);
router.delete('/lessons/:id', AdminController.deleteLesson);
router.post('/lessons/:id/clone', AdminController.cloneLesson);
router.put('/lessons/:id/content', AdminController.updateLessonContent);
// PYQs
router.post('/lessons/:lessonId/pyqs', AdminController.createPYQ);
router.put('/pyqs/:id', AdminController.updatePYQ);
router.delete('/pyqs/:id', AdminController.deletePYQ);
// Reordering
router.patch('/reorder/modules', AdminController.reorderModules);
router.patch('/reorder/lessons', AdminController.reorderLessons);
router.patch('/reorder/videos', AdminController.reorderVideos);
router.patch('/reorder/pyqs', AdminController.reorderPYQs);
router.patch('/reorder/quiz-questions', AdminController.reorderQuizQuestions);
// Branches
router.get('/branches', AdminController.listBranches);
router.post('/branches', AdminController.createBranch);
router.put('/branches/:id', AdminController.updateBranch);
router.delete('/branches/:id', AdminController.deleteBranch);
export default router;
//# sourceMappingURL=adminRoutes.js.map