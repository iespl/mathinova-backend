import prisma from '../utils/prisma.js';
import { EntityStatus } from '@prisma/client';
export class CourseService {
    static async createCourse(title, description, basePrice, slug) {
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
    static async getCourses(status) {
        return prisma.course.findMany({
            where: status ? { status } : {},
            include: {
                _count: {
                    select: { modules: true }
                }
            }
        });
    }
    static async getCourseBySlug(slug) {
        const course = await prisma.course.findUnique({
            where: { slug },
            relationLoadStrategy: 'join', // Added to reduce round-trips
            include: {
                modules: {
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            include: {
                                videos: true,
                                quiz: true,
                                pyqs: true
                            }
                        }
                    }
                }
            }
        });
        if (!course)
            return null;
        // Calculate counts
        let totalLessons = 0;
        let totalVideos = 0;
        let totalQuizzes = 0;
        let totalPYQs = 0;
        course.modules.forEach(mod => {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach(lesson => {
                totalVideos += lesson.videos.length;
                if (lesson.quiz)
                    totalQuizzes++;
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
    static async getPublicCourse(slugOrId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
        const course = await prisma.course.findUnique({
            where: isUuid ? { id: slugOrId } : { slug: slugOrId },
            relationLoadStrategy: 'join',
            include: {
                modules: {
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            include: {
                                videos: {
                                    select: {
                                        id: true,
                                        title: true,
                                        duration: true,
                                        isSample: true,
                                        videoUrl: true
                                    }
                                },
                                quiz: {
                                    select: {
                                        id: true
                                    }
                                },
                                pyqs: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!course)
            return null;
        // Mask video URLs for non-sample videos
        course.modules.forEach(mod => {
            mod.lessons.forEach(lesson => {
                lesson.videos.forEach((vid) => {
                    if (!vid.isSample) {
                        vid.videoUrl = null;
                    }
                });
            });
        });
        // Calculate counts (same as getCourseBySlug)
        let totalLessons = 0;
        let totalVideos = 0;
        let totalQuizzes = 0;
        let totalPYQs = 0;
        course.modules.forEach(mod => {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach(lesson => {
                totalVideos += lesson.videos.length;
                if (lesson.quiz)
                    totalQuizzes++;
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
    static async getCourseById(id) {
        const course = await prisma.course.findUnique({
            where: { id },
            relationLoadStrategy: 'join', // Added to reduce round-trips
            include: {
                modules: {
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            include: {
                                videos: true,
                                quiz: true,
                                pyqs: true
                            }
                        }
                    }
                }
            }
        });
        if (!course)
            return null;
        // Calculate counts
        let totalLessons = 0;
        let totalVideos = 0;
        let totalQuizzes = 0;
        let totalPYQs = 0;
        course.modules.forEach(mod => {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach(lesson => {
                totalVideos += lesson.videos.length;
                if (lesson.quiz)
                    totalQuizzes++;
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
    static async updateCourse(id, data) {
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
    static async addModule(courseId, title, order) {
        return prisma.module.create({
            data: { courseId, title, order }
        });
    }
    static async addLesson(moduleId, title, order) {
        return prisma.lesson.create({
            data: { moduleId, title, order }
        });
    }
    static async updateLesson(lessonId, data) {
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
    static async softDeleteLesson(lessonId) {
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
//# sourceMappingURL=courseService.js.map