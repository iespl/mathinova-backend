import { Router } from 'express';
import { StudentController } from '../controllers/studentController.js';
import { authenticate } from '../middlewares/auth.js';
const router = Router();
router.use(authenticate);
router.get('/courses', StudentController.getMyCourses);
router.post('/enroll-free', StudentController.enrollFree);
router.get('/courses/:slugOrId/content', StudentController.getCourseContent);
router.post('/progress/video', StudentController.updateVideoProgress);
router.post('/progress/quiz', StudentController.recordQuizAttempt);
router.patch('/progress/:lesson_id', StudentController.updateLessonProgress);
// Quiz & PYQ Refinement
router.get('/quiz/:lessonId', StudentController.getLessonQuiz);
router.post('/quiz/start', StudentController.startQuizAttempt);
router.post('/quiz/submit', StudentController.submitQuizAttempt);
router.get('/lesson/:lessonId/pyqs', StudentController.getLessonPYQs);
router.post('/pyq/:pyqId/view', StudentController.trackPYQView);
export default router;
//# sourceMappingURL=studentRoutes.js.map