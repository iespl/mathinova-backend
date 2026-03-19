import { CourseService } from '../services/courseService.js';
import { EntityStatus } from '@prisma/client';
import cache from '../utils/cache.js';
export class CourseController {
    static async getAllCourses(req, res) {
        try {
            // Public listing should strictly only include published courses
            const courses = await CourseService.getCourses(EntityStatus.published);
            res.json(courses);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getCourseDetails(req, res) {
        try {
            const slugOrId = req.params.slug;
            // Check if input is a valid UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
            const course = isUuid
                ? await CourseService.getCourseById(slugOrId)
                : await CourseService.getCourseBySlug(slugOrId);
            if (!course)
                return res.status(404).json({ message: 'Course not found' });
            res.json(course);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getPublicCourseDetails(req, res) {
        try {
            const slug = req.params.slug;
            // Check cache first
            const cacheKey = `public:course:${slug}`;
            const cached = cache.get(cacheKey);
            if (cached) {
                return res.json(cached);
            }
            // Cache miss - fetch from database with query-level filtering
            const course = await CourseService.getPublicCourse(slug);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Transform to public response format
            const publicCourse = {
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.description,
                longDescription: course.longDescription,
                basePrice: course.basePrice,
                currency: course.currency,
                thumbnail: course.thumbnail,
                pricingType: course.pricingType,
                category: course.category,
                branch: course.branch, // Added branch field
                level: course.level,
                promoVideoUrl: course.promoVideoUrl,
                validityDays: course.validityDays,
                learningPoints: course.learningPoints,
                _counts: course._counts,
                modules: course.modules.map((mod) => ({
                    id: mod.id,
                    title: mod.title,
                    order: mod.order,
                    lessons: mod.lessons.map((lesson) => ({
                        id: lesson.id,
                        title: lesson.title,
                        order: lesson.order,
                        isWrapper: lesson.isWrapper,
                        videos: lesson.videos, // Already filtered to sample videos only
                        quiz: !!lesson.quiz,
                        pyqs: lesson.pyqs // Pass the full array (content already masked for non-sample PYQs)
                    }))
                }))
            };
            // Store in cache with 5-minute TTL
            cache.set(cacheKey, publicCourse);
            res.json(publicCourse);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async createCourse(req, res) {
        try {
            const { title, description, basePrice, slug } = req.body;
            const course = await CourseService.createCourse(title, description, basePrice, slug);
            res.status(201).json(course);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateCourse(req, res) {
        try {
            const id = req.params.id;
            const course = await CourseService.updateCourse(id, req.body);
            res.json(course);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async listBranches(req, res) {
        try {
            const branches = await CourseService.getAllBranches();
            res.json(branches);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
//# sourceMappingURL=courseController.js.map