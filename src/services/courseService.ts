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

        // 1. Fetch Course
        const course = await prisma.course.findUnique({
            where: isUuid ? { id: slugOrId, status: EntityStatus.published } : { slug: slugOrId, status: EntityStatus.published },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                basePrice: true,
                currency: true,
                status: true,
                createdAt: true,
                category: true,
                level: true,
                thumbnail: true,
                pricingType: true,
                promoVideoUrl: true,
                validityDays: true,
                branch: true,
                subjectType: true,
                courseCode: true,
                longDescription: true,
                learningPoints: true,
                _count: {
                    select: {
                        modules: true,
                        enrollments: true
                    }
                }
            }
        });

        if (!course) return null;

        const courseId = course.id;
        const isFree = (course as any).pricingType === 'free';

        // 2. Fetch Modules
        const modules = await prisma.module.findMany({
            where: { courseId },
            orderBy: { order: 'asc' }
        });

        const moduleIds = modules.map(m => m.id);

        // 3. Fetch Lessons
        const allLessons = await prisma.lesson.findMany({
            where: { moduleId: { in: moduleIds }, isDeleted: false },
            orderBy: { order: 'asc' },
            include: {
                quiz: {
                    select: { id: true }
                }
            }
        });

        const lessonIds = allLessons.map(l => l.id);

        // 4. Fetch Videos
        const allVideos = await prisma.video.findMany({
            where: { lessonId: { in: lessonIds } },
            orderBy: { order: 'asc' }
        });

        // 5. Fetch PYQs
        const allPYQs = await prisma.pYQ.findMany({
            where: { lessonId: { in: lessonIds }, isPublished: true },
            orderBy: { order: 'asc' }
        });

        // Assemble data structures for fast lookups
        const videosByLesson = new Map<string, any[]>();
        allVideos.forEach(v => {
            if (!videosByLesson.has(v.lessonId)) videosByLesson.set(v.lessonId, []);
            if (!isFree && !v.isSample) {
                (v as any).videoUrl = null;
            }
            videosByLesson.get(v.lessonId)!.push(v);
        });

        const pyqsByLesson = new Map<string, any[]>();
        allPYQs.forEach(p => {
            if (!pyqsByLesson.has(p.lessonId)) pyqsByLesson.set(p.lessonId, []);
            if (!isFree && !p.isSample) {
                (p as any).questionText = 'Unlock premium content to view this PYQ';
                (p as any).questionImages = [];
                (p as any).answerImages = [];
                (p as any).solutionVideoUrl = null;
                (p as any).answerText = null;
            }
            pyqsByLesson.get(p.lessonId)!.push(p);
        });

        const lessonsByModule = new Map<string, any[]>();
        let totalVideos = 0;
        let totalPYQs = 0;
        let totalQuizzes = 0;

        allLessons.forEach(l => {
            if (!lessonsByModule.has(l.moduleId)) lessonsByModule.set(l.moduleId, []);
            const videos = videosByLesson.get(l.id) || [];
            const pyqs = pyqsByLesson.get(l.id) || [];
            
            totalVideos += videos.length;
            totalPYQs += pyqs.length;
            if (l.quiz) totalQuizzes++;

            lessonsByModule.get(l.moduleId)!.push({
                ...l,
                videos,
                pyqs,
                _count: {
                    videos: videos.length,
                    pyqs: pyqs.length
                }
            });
        });

        const assembledModules = modules.map(m => ({
            ...m,
            lessons: lessonsByModule.get(m.id) || []
        }));

        return {
            ...course,
            modules: assembledModules,
            _counts: {
                modules: (course as any)._count.modules,
                lessons: allLessons.length,
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
