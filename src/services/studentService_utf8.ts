import prisma from '../utils/prisma.js';
import { EnrollmentStatus } from '@prisma/client';

export class StudentService {
    static async getEnrolledCourses(userId: string) {
        return prisma.enrollment.findMany({
            where: {
                userId,
                status: EnrollmentStatus.active,
                expiresAt: { gt: new Date() }
            },
            include: {
                course: {
                    include: {
                        _count: { select: { modules: true } }
                    }
                }
            }
        });
    }

    static async getCourseContent(userId: string, courseId: string) {
        // 1. Check Enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId }
            }
        });

        if (!enrollment || enrollment.status !== 'active') {
            throw new Error('Access Denied: You are not enrolled in this course.');
        }

        // 2. Fetch Full Content (including videos)
        return prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            orderBy: { order: 'asc' },
                            include: {
                                videos: true,
                                resources: true
                            }
                        }
                    }
                }
            }
        });
    }

    static async updateProgress(userId: string, lessonId: string, completed: boolean, lastWatchedPosition: number) {
        // 1. Verify Active Enrollment (v1.4.1 Compliance)
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });

        if (!lesson) throw new Error('Lesson not found');

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lesson.module.courseId
                }
            }
        });

        if (!enrollment || enrollment.status !== EnrollmentStatus.active || (enrollment.expiresAt && enrollment.expiresAt < new Date())) {
            throw new Error('Access denied: Enrollment inactive or expired');
        }

        // 2. Update Progress using composite unique key
        return prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId
                }
            },
            update: {
                completed,
                lastWatchedPosition
            },
            create: {
                userId,
                lessonId,
                courseId: lesson.module.courseId,
                completed,
                lastWatchedPosition
            }
        });
    }
}
