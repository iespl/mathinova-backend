import { Request, Response } from 'express';
import { StudentService } from '../services/studentService.js';
import { AuthRequest } from '../middlewares/auth.js';

export class StudentController {
    static async getMyCourses(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const enrollments = await StudentService.getEnrolledCourses(userId);
            res.json(enrollments);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async enrollFree(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const { courseId } = req.body;
            const enrollment = await StudentService.enrollFree(userId, courseId);
            res.json(enrollment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getCourseContent(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const slugOrId = req.params.slugOrId as string;
            const content = await StudentService.getCourseContent(userId, slugOrId);
            if (!content) return res.status(404).json({ message: 'Course content not found' });
            res.json(content);
        } catch (error: any) {
            if (error.message.includes('Access Denied')) {
                return res.status(403).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    static async updateVideoProgress(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const { lessonId, videoId, lastWatchedPosition } = req.body;
            const progress = await StudentService.updateVideoProgress(userId, lessonId, videoId, lastWatchedPosition);
            res.json(progress);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async recordQuizAttempt(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const { lessonId } = req.body;
            const progress = await StudentService.recordQuizAttempt(userId, lessonId);
            res.json(progress);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async updateLessonProgress(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const lessonId = req.params.lesson_id as string;
            const { completed, lastWatchedPosition } = req.body;

            const progress = await StudentService.updateProgress(userId, lessonId, completed, lastWatchedPosition);
            res.json(progress);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getLessonQuiz(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const lessonId = req.params.lessonId as string;
            const quiz = await StudentService.getLessonQuiz(userId, lessonId);
            if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
            res.json(quiz);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async startQuizAttempt(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const { quizId } = req.body;
            const attempt = await StudentService.startQuizAttempt(userId, quizId);
            res.json(attempt);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async submitQuizAttempt(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const { quizId, attemptId, answers } = req.body;
            const result = await StudentService.submitQuizAttempt(userId, quizId, attemptId, answers);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getLessonPYQs(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const lessonId = req.params.lessonId as string;
            const pyqs = await StudentService.getLessonPYQs(userId, lessonId);
            res.json(pyqs);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async trackPYQView(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user!.id;
            const pyqId = req.params.pyqId as string;
            await StudentService.trackPYQView(userId, pyqId);
            res.status(200).send();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
