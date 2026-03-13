import { Request, Response } from 'express';
export declare class CourseController {
    static getAllCourses(req: Request, res: Response): Promise<void>;
    static getCourseDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getPublicCourseDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createCourse(req: Request, res: Response): Promise<void>;
    static updateCourse(req: Request, res: Response): Promise<void>;
    static listBranches(req: Request, res: Response): Promise<void>;
}
