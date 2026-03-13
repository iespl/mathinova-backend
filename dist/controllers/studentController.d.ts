import { Request, Response } from 'express';
export declare class StudentController {
    static getMyCourses(req: Request, res: Response): Promise<void>;
    static enrollFree(req: Request, res: Response): Promise<void>;
    static getCourseContent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateVideoProgress(req: Request, res: Response): Promise<void>;
    static recordQuizAttempt(req: Request, res: Response): Promise<void>;
    static updateLessonProgress(req: Request, res: Response): Promise<void>;
    static getLessonQuiz(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static startQuizAttempt(req: Request, res: Response): Promise<void>;
    static submitQuizAttempt(req: Request, res: Response): Promise<void>;
    static getLessonPYQs(req: Request, res: Response): Promise<void>;
    static trackPYQView(req: Request, res: Response): Promise<void>;
}
