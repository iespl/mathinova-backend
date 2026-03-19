import prisma from '../utils/prisma.js';
import { EntityStatus } from '@prisma/client';

export class CourseService {
    static async createCourse(title: string, description: string, basePrice: number, slug: string) {
        return prisma.course.create({
            data: {
                title,
                description,
                basePrice,
                slug,
                status: EntityStatus.draft
            }
        });
    }

    static async getCourses(status?: EntityStatus) {
        return prisma.course.findMany({
            where: status ? { status } : {},
            include: {
                _count: {
                    select: { modules: true }
                }
            }
        });
    }

    static async getCourseBySlug(slug: string) {
        const course = await prisma.course.findUnique({
            where: { slug },
            // Switch to separate queries to avoid Cartesian product and improve performance for large courses
            relationLoadStrategy: 'query', 
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            orderBy: { order: 'asc' },
                            include: {
                                videos: { orderBy: { order: 'asc' } },
                                quiz: true,
                                pyqs: { orderBy: { order: 'asc' } }
                            }
                        }
                    }
                }
            }
        });

        if (!course) return null;

        // Calculate counts
        let totalLessons = 0;
        let totalVideos = 0;
        let totalQuizzes = 0;
        let totalPYQs = 0;

        course.modules.forEach(mod => {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach(lesson => {
                totalVideos += lesson.videos.length;
                if (lesson.quiz) totalQuizzes++;
                totalPYQs += lesson.pyqs.length;
            });
        });

        return {
            ...course,
            _counts: {
                modules: course.modules.length,
                lessons: totalLessons,
                videos: totalVideos,
                quizzes: totalQuizzes,
                pyqs: totalPYQs
            }
        };
    }

    // Public endpoint - returns only sample videos with query-level filtering
    static async getPublicCourse(slugOrId: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

        const course = await prisma.course.findUnique({
            where: isUuid ? { id: slugOrId, status: EntityStatus.published } : { slug: slugOrId, status: EntityStatus.published },
            // Switch to separate queries to avoid Cartesian product and improve performance for large courses
            relationLoadStrategy: 'query', 
            include: {
                _count: {
                    select: {
                        modules: true,
                        enrollments: true
                    }
                },
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            orderBy: { order: 'asc' },
                            include: {
                                _count: {
                                    select: {
                                        videos: true,
                                        pyqs: true
                                    }
                                },
                                videos: {
                                    where: { isSample: true }, // Filter samples at the database level for public page
                                    select: {
                                        id: true,
                                        title: true,
                                        duration: true,
                                        isSample: true,
                                        videoUrl: true,
                                        order: true
                                    },
                                    orderBy: { order: 'asc' }
                                },
                                quiz: {
                                    select: {
                                        id: true
                                    }
                                },
                                pyqs: {
                                    where: { isSample: true, isPublished: true }, // Filter samples at the database level
                                    select: {
                                        id: true,
                                        isSample: true,
                                        questionType: true,
                                        questionText: true,
                                        questionImages: true,
                                        answerImages: true,
                                        solutionVideoUrl: true,
                                        answerText: true,
                                        order: true
                                    },
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!course) return null;

        // Calculate counts using pre-calculated aggregate fields
        let totalLessons = 0;
        let totalVideos = 0;
        let totalQuizzes = 0;
        let totalPYQs = 0;

        course.modules.forEach(mod => {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach(lesson => {
                totalVideos += (lesson as any)._count.videos;
                if (lesson.quiz) totalQuizzes++;
                totalPYQs += (lesson as any)._count.pyqs;
            });
        });

        return {
            ...course,
            _counts: {
                modules: course._count.modules,
                lessons: totalLessons,
                videos: totalVideos,
                quizzes: totalQuizzes,
                pyqs: totalPYQs
            }
        };
    }

    static async getCourseById(id: string) {
        const course = await prisma.course.findUnique({
            where: { id },
            // Switch to separate queries to avoid Cartesian product and improve performance for large courses
            relationLoadStrategy: 'query', 
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            orderBy: { order: 'asc' },
                            include: {
                                videos: { orderBy: { order: 'asc' } },
                                quiz: true,
                                pyqs: { orderBy: { order: 'asc' } }
                            }
                        }
                    }
                }
            }
        });

        if (!course) return null;

        // Calculate counts
        let totalLessons = 0;
        let totalVideos = 0;
        let totalQuizzes = 0;
        let totalPYQs = 0;

        course.modules.forEach(mod => {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach(lesson => {
                totalVideos += lesson.videos.length;
                if (lesson.quiz) totalQuizzes++;
                totalPYQs += lesson.pyqs.length;
            });
        });

        return {
            ...course,
            _counts: {
                modules: course.modules.length,
                lessons: totalLessons,
                videos: totalVideos,
                quizzes: totalQuizzes,
                pyqs: totalPYQs
            }
        };
    }

    static async updateCourse(id: string, data: any) {
        // Fetch current course to get old slug before update
        const currentCourse = await prisma.course.findUnique({
            where: { id },
            select: { slug: true }
        });

        const updatedCourse = await prisma.course.update({
            where: { id },
            data
        });

        // Invalidate cache for old slug
        if (currentCourse?.slug) {
            const oldCacheKey = `public:course:${currentCourse.slug}`;
            const cache = (await import('../utils/cache.js')).default;
            cache.invalidate(oldCacheKey);
        }

        // If slug changed, also invalidate new slug
        if (data.slug && data.slug !== currentCourse?.slug) {
            const newCacheKey = `public:course:${data.slug}`;
            const cache = (await import('../utils/cache.js')).default;
            cache.invalidate(newCacheKey);
        }

        return updatedCourse;
    }

    static async addModule(courseId: string, title: string, order: number) {
        return prisma.module.create({
            data: { courseId, title, order }
        });
    }

    static async addLesson(moduleId: string, title: string, order: number) {
        return prisma.lesson.create({
            data: { moduleId, title, order }
        });
    }

    static async updateLesson(lessonId: string, data: any) {
        const currentLesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (data.videoUrl || data.fileUrl) {
            data.version = (currentLesson?.version || 1) + 1;
        }

        return prisma.lesson.update({
            where: { id: lessonId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }

    static async softDeleteLesson(lessonId: string) {
        return prisma.lesson.update({
            where: { id: lessonId },
            data: { isDeleted: true }
        });
    }

    static async getAllBranches() {
        return prisma.branch.findMany({
            orderBy: { name: 'asc' }
        });
    }
}
