import prisma from '../utils/prisma.js';
import { PaymentStatus, EnrollmentStatus } from '@prisma/client';
import { AuditService } from './auditService.js';
export class AdminService {
    /**
     * Atomic Refund Logic (Compliance v1.4.1)
     * Hardened with SERIALIZABLE isolation and direct enrollment resolution.
     */
    static async refundPayment(adminId, paymentId, reason) {
        return prisma.$transaction(async (tx) => {
            // 1. Fetch current states for audit
            const paymentBefore = await tx.payment.findUnique({
                where: { id: paymentId },
                include: { order: true }
            });
            if (!paymentBefore)
                throw new Error('Payment not found');
            // Idempotency Guard
            if (paymentBefore.status === PaymentStatus.refunded) {
                throw new Error('Payment already refunded');
            }
            // Resolving Enrollment directly via Payment -> Order association
            // Uses the unique composite key for guaranteed row resolution
            const enrollmentBefore = await tx.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: paymentBefore.order.userId || '',
                        courseId: paymentBefore.order.courseId
                    }
                }
            });
            if (!enrollmentBefore) {
                throw new Error('No enrollment found for this payment');
            }
            // 2. Perform Atomic status updates
            const paymentAfter = await tx.payment.update({
                where: { id: paymentId },
                data: { status: PaymentStatus.refunded }
            });
            let enrollmentAfter = null;
            if (enrollmentBefore) {
                enrollmentAfter = await tx.enrollment.update({
                    where: { id: enrollmentBefore.id },
                    data: { status: EnrollmentStatus.refunded }
                });
            }
            // 3. Log the Audit Event with full snapshots
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'REFUND_PAYMENT',
                entityType: 'Payment',
                entityId: paymentId,
                beforeState: { payment: paymentBefore, enrollment: enrollmentBefore, reason },
                afterState: { payment: paymentAfter, enrollment: enrollmentAfter, reason }
            });
            return { payment: paymentAfter, enrollment: enrollmentAfter };
        }, { isolationLevel: 'Serializable', timeout: 10000 });
    }
    static async getOrders() {
        return prisma.order.findMany({
            include: {
                user: true,
                payments: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    // --- User Management ---
    static async getUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: { enrollments: true, orders: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async toggleUserStatus(adminId, userId, isActive) {
        const userBefore = await prisma.user.findUnique({ where: { id: userId } });
        if (!userBefore)
            throw new Error('User not found');
        const userAfter = await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
        await AuditService.logAction({
            actorUserId: adminId,
            action: isActive ? 'ENABLE_USER' : 'DISABLE_USER',
            entityType: 'User',
            entityId: userId,
            beforeState: { isActive: userBefore.isActive },
            afterState: { isActive: userAfter.isActive }
        });
        return userAfter;
    }
    // --- Course Management ---
    static async listCourses() {
        return prisma.course.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { enrollments: true, modules: true }
                }
            }
        });
    }
    static async createCourse(adminId, data) {
        // Generate slug if not provided (simple retry strategy or unique check required in real app)
        const slug = data.slug || data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const course = await prisma.course.create({
            data: {
                ...data,
                slug,
                status: 'draft', // default
            }
        });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'CREATE_COURSE',
            entityType: 'Course',
            entityId: course.id,
            beforeState: null,
            afterState: course
        });
        return course;
    }
    static async updateCourse(adminId, courseId, data) {
        try {
            const before = await prisma.course.findUnique({ where: { id: courseId } });
            if (!before)
                throw new Error('Course not found');
            // Sanitize data: remove non-model fields that might come from frontend (e.g. modules, _count)
            const { modules, _count, id, createdAt, updatedAt, ...updateData } = data;
            const after = await prisma.course.update({
                where: { id: courseId },
                data: { ...updateData }
            });
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'UPDATE_COURSE',
                entityType: 'Course',
                entityId: courseId,
                beforeState: before,
                afterState: after
            });
            return after;
        }
        catch (error) {
            console.error(`[AdminService.updateCourse] Failed for id ${courseId}:`, error);
            throw error;
        }
    }
    static async deleteCourse(adminId, courseId) {
        const before = await prisma.course.findUnique({ where: { id: courseId } });
        if (!before)
            throw new Error('Course not found');
        await prisma.course.delete({ where: { id: courseId } });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'DELETE_COURSE',
            entityType: 'Course',
            entityId: courseId,
            beforeState: before,
            afterState: null
        });
        return { success: true };
    }
    static async getCourseById(courseId) {
        return prisma.course.findUnique({
            where: { id: courseId },
            relationLoadStrategy: 'join',
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                _count: {
                                    select: {
                                        videos: true,
                                        pyqs: true
                                    }
                                },
                                quiz: {
                                    select: { id: true }
                                }
                            },
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    static async getCourseBasicOnly(courseId) {
        return prisma.course.findUnique({
            where: { id: courseId }
        });
    }
    static async getLessonDetails(lessonId) {
        return prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                videos: {
                    orderBy: { order: 'asc' }
                },
                pyqs: {
                    include: {
                        occurrences: true
                    },
                    orderBy: { order: 'asc' }
                },
                quiz: {
                    include: {
                        questions: {
                            include: {
                                options: true
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        });
    }
    // --- Content Operations (Modules/Lessons) ---
    static async addModule(courseId, title, order) {
        return prisma.module.create({
            data: { courseId, title, order }
        });
    }
    static async updateModule(adminId, moduleId, data) {
        const before = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!before)
            throw new Error('Module not found');
        const after = await prisma.module.update({
            where: { id: moduleId },
            data
        });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'UPDATE_MODULE',
            entityType: 'Module',
            entityId: moduleId,
            beforeState: before,
            afterState: after
        });
        return after;
    }
    static async deleteModule(adminId, moduleId) {
        const before = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!before)
            throw new Error('Module not found');
        await prisma.module.delete({ where: { id: moduleId } });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'DELETE_MODULE',
            entityType: 'Module',
            entityId: moduleId,
            beforeState: before,
            afterState: null
        });
        return { success: true };
    }
    static async addLesson(moduleId, title, order) {
        return prisma.lesson.create({
            data: { moduleId, title, order }
        });
    }
    static async deleteLesson(adminId, lessonId) {
        const before = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!before)
            throw new Error('Lesson not found');
        await prisma.lesson.delete({ where: { id: lessonId } });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'DELETE_LESSON',
            entityType: 'Lesson',
            entityId: lessonId,
            beforeState: before,
            afterState: null
        });
        return { success: true };
    }
    static async updateLesson(adminId, lessonId, data) {
        const before = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!before)
            throw new Error('Lesson not found');
        const after = await prisma.lesson.update({
            where: { id: lessonId },
            data
        });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'UPDATE_LESSON',
            entityType: 'Lesson',
            entityId: lessonId,
            beforeState: before,
            afterState: after
        });
        return after;
    }
    static async cloneLesson(adminId, lessonId, targetModuleId) {
        return prisma.$transaction(async (tx) => {
            // 1. Fetch source lesson with all nested data
            const source = await tx.lesson.findUnique({
                where: { id: lessonId },
                include: {
                    videos: true,
                    pyqs: { include: { occurrences: true } },
                    quiz: {
                        include: {
                            questions: {
                                include: { options: true }
                            }
                        }
                    }
                }
            });
            if (!source)
                throw new Error('Source lesson not found');
            // 2. Determine target order
            const maxOrder = await tx.lesson.findFirst({
                where: { moduleId: targetModuleId },
                orderBy: { order: 'desc' },
                select: { order: true }
            });
            const targetOrder = (maxOrder?.order ?? -1) + 1;
            // 3. Deep Clone
            const cloned = await tx.lesson.create({
                data: {
                    moduleId: targetModuleId,
                    title: `${source.title} (Copy)`,
                    order: targetOrder,
                    completionRule: source.completionRule,
                    isWrapper: source.isWrapper,
                    videos: {
                        create: source.videos.map(v => ({
                            title: v.title,
                            videoUrl: v.videoUrl,
                            duration: v.duration,
                            order: v.order,
                            isSample: v.isSample
                        }))
                    },
                    pyqs: {
                        create: source.pyqs.map(p => ({
                            questionType: p.questionType,
                            questionText: p.questionText,
                            answerText: p.answerText,
                            questionImages: p.questionImages,
                            answerImages: p.answerImages,
                            solutionVideoUrl: p.solutionVideoUrl,
                            difficulty: p.difficulty,
                            order: p.order,
                            isSample: p.isSample,
                            description: p.description,
                            occurrences: {
                                create: p.occurrences.map(o => ({
                                    year: o.year,
                                    month: o.month,
                                    courseCode: o.courseCode,
                                    part: o.part
                                }))
                            }
                        }))
                    },
                    quiz: source.quiz ? {
                        create: {
                            title: source.quiz.title,
                            description: source.quiz.description,
                            isPublished: source.quiz.isPublished,
                            questions: {
                                create: source.quiz.questions.map(q => ({
                                    type: q.type,
                                    prompt: q.prompt,
                                    order: q.order,
                                    numericValue: q.numericValue,
                                    tolerance: q.tolerance,
                                    options: {
                                        create: q.options.map(o => ({
                                            text: o.text,
                                            isCorrect: o.isCorrect
                                        }))
                                    }
                                }))
                            }
                        }
                    } : undefined
                }
            });
            // 4. Log Audit
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'CLONE_LESSON',
                entityType: 'Lesson',
                entityId: cloned.id,
                beforeState: { sourceId: lessonId },
                afterState: { targetModuleId, newId: cloned.id }
            });
            return cloned;
        }, { timeout: 60000 });
    }
    static async cloneModule(adminId, moduleId, targetCourseId) {
        return prisma.$transaction(async (tx) => {
            // 1. Fetch source module with all lessons and content
            const source = await tx.module.findUnique({
                where: { id: moduleId },
                include: {
                    lessons: {
                        include: {
                            videos: true,
                            pyqs: { include: { occurrences: true } },
                            quiz: {
                                include: {
                                    questions: {
                                        include: { options: true }
                                    }
                                }
                            }
                        },
                        orderBy: { order: 'asc' }
                    }
                }
            });
            if (!source)
                throw new Error('Source module not found');
            // 2. Determine target order
            const maxOrder = await tx.module.findFirst({
                where: { courseId: targetCourseId },
                orderBy: { order: 'desc' },
                select: { order: true }
            });
            const targetOrder = (maxOrder?.order ?? -1) + 1;
            // 3. Create new Module
            const clonedModule = await tx.module.create({
                data: {
                    courseId: targetCourseId,
                    title: `${source.title} (Copy)`,
                    order: targetOrder
                }
            });
            // 4. Clone each lesson into the new module
            for (const lesson of source.lessons) {
                await tx.lesson.create({
                    data: {
                        moduleId: clonedModule.id,
                        title: lesson.title, // Keep lesson titles same as original within the copied module
                        order: lesson.order,
                        completionRule: lesson.completionRule,
                        isWrapper: lesson.isWrapper,
                        videos: {
                            create: lesson.videos.map(v => ({
                                title: v.title,
                                videoUrl: v.videoUrl,
                                duration: v.duration,
                                order: v.order,
                                isSample: v.isSample
                            }))
                        },
                        pyqs: {
                            create: lesson.pyqs.map(p => ({
                                questionType: p.questionType,
                                questionText: p.questionText,
                                answerText: p.answerText,
                                questionImages: p.questionImages,
                                answerImages: p.answerImages,
                                solutionVideoUrl: p.solutionVideoUrl,
                                difficulty: p.difficulty,
                                order: p.order,
                                isSample: p.isSample,
                                description: p.description,
                                occurrences: {
                                    create: p.occurrences.map(o => ({
                                        year: o.year,
                                        month: o.month,
                                        courseCode: o.courseCode,
                                        part: o.part
                                    }))
                                }
                            }))
                        },
                        quiz: lesson.quiz ? {
                            create: {
                                title: lesson.quiz.title,
                                description: lesson.quiz.description,
                                isPublished: lesson.quiz.isPublished,
                                questions: {
                                    create: lesson.quiz.questions.map(q => ({
                                        type: q.type,
                                        prompt: q.prompt,
                                        order: q.order,
                                        numericValue: q.numericValue,
                                        tolerance: q.tolerance,
                                        options: {
                                            create: q.options.map(o => ({
                                                text: o.text,
                                                isCorrect: o.isCorrect
                                            }))
                                        }
                                    }))
                                }
                            }
                        } : undefined
                    }
                });
            }
            // 5. Log Audit
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'CLONE_MODULE',
                entityType: 'Module',
                entityId: clonedModule.id,
                beforeState: { sourceId: moduleId },
                afterState: { targetCourseId, newId: clonedModule.id, lessonsCount: source.lessons.length }
            });
            return clonedModule;
        }, { timeout: 60000 });
    }
    // --- Reordering Logic ---
    static async reorderModules(adminId, moduleIdOrders) {
        return prisma.$transaction(async (tx) => {
            const updates = moduleIdOrders.map(item => tx.module.update({
                where: { id: item.id },
                data: { order: item.order }
            }));
            const results = await Promise.all(updates);
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'REORDER_MODULES',
                entityType: 'Course',
                entityId: results[0]?.courseId || 'unknown',
                beforeState: moduleIdOrders,
                afterState: results
            });
            return results;
        });
    }
    static async reorderLessons(adminId, lessonIdOrders) {
        return prisma.$transaction(async (tx) => {
            const updates = lessonIdOrders.map(item => tx.lesson.update({
                where: { id: item.id },
                data: {
                    moduleId: item.moduleId,
                    order: item.order
                }
            }));
            const results = await Promise.all(updates);
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'REORDER_LESSONS',
                entityType: 'Module',
                entityId: lessonIdOrders[0]?.moduleId || 'unknown',
                beforeState: lessonIdOrders,
                afterState: results
            });
            return results;
        });
    }
    static async reorderVideos(adminId, videoIdOrders) {
        return prisma.$transaction(async (tx) => {
            const updates = videoIdOrders.map(item => tx.video.update({
                where: { id: item.id },
                data: {
                    lessonId: item.lessonId,
                    order: item.order
                }
            }));
            const results = await Promise.all(updates);
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'REORDER_VIDEOS',
                entityType: 'Lesson',
                entityId: videoIdOrders[0]?.lessonId || 'unknown',
                beforeState: videoIdOrders,
                afterState: results
            });
            return results;
        });
    }
    static async reorderPYQs(adminId, pyqIdOrders) {
        return prisma.$transaction(async (tx) => {
            const updates = pyqIdOrders.map(item => tx.pYQ.update({
                where: { id: item.id },
                data: {
                    lessonId: item.lessonId,
                    order: item.order
                }
            }));
            const results = await Promise.all(updates);
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'REORDER_PYQS',
                entityType: 'Lesson',
                entityId: pyqIdOrders[0]?.lessonId || 'unknown',
                beforeState: pyqIdOrders,
                afterState: results
            });
            return results;
        });
    }
    static async reorderQuizQuestions(adminId, questionIdOrders) {
        return prisma.$transaction(async (tx) => {
            const updates = questionIdOrders.map(item => tx.question.update({
                where: { id: item.id },
                data: {
                    quizId: item.quizId,
                    order: item.order
                }
            }));
            const results = await Promise.all(updates);
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'REORDER_QUESTIONS',
                entityType: 'Quiz',
                entityId: questionIdOrders[0]?.quizId || 'unknown',
                beforeState: questionIdOrders,
                afterState: results
            });
            return results;
        });
    }
    static async updateLessonContent(adminId, lessonId, videos, pyqs, quiz) {
        // Increase timeout to 5 minutes (300,000ms) for large lessons
        return prisma.$transaction(async (tx) => {
            console.log(`[updateLessonContent] Starting transaction for lesson ${lessonId} by admin ${adminId}`);
            // 1. Update Videos
            if (videos) {
                await tx.video.deleteMany({ where: { lessonId } });
                if (videos.length > 0) {
                    await tx.video.createMany({
                        data: videos.map((v, idx) => ({
                            lessonId,
                            title: v.title,
                            videoUrl: v.videoUrl,
                            duration: v.duration || 0,
                            isSample: v.isSample || false,
                            order: v.order !== undefined ? v.order : idx
                        }))
                    });
                }
            }
            // 2. Update PYQs and Occurrences
            if (pyqs) {
                const validIds = pyqs.map((p) => p.id).filter((id) => id && !String(id).startsWith('new-'));
                // Get pre-state for auditing before we delete anything
                const existingPYQs = await tx.pYQ.findMany({
                    where: { lessonId },
                    select: { id: true }
                });
                const existingIds = existingPYQs.map(p => p.id);
                // Bulk delete removed PYQs (and their occurrences via cascade)
                await tx.pYQ.deleteMany({
                    where: {
                        lessonId,
                        id: { notIn: validIds }
                    }
                });
                // Clear all occurrences for remaining PYQs to bulk recreate them
                await tx.pYQOccurrence.deleteMany({
                    where: {
                        pyq: { lessonId }
                    }
                });
                const allOccurrences = [];
                for (const [idx, p] of pyqs.entries()) {
                    const orderValue = p.order !== undefined ? p.order : idx;
                    const isNew = !p.id || String(p.id).startsWith('new-');
                    let pyqId = p.id;
                    if (!isNew) {
                        // Update existing PYQ (without nested occurrences)
                        await tx.pYQ.update({
                            where: { id: p.id },
                            data: {
                                questionType: p.questionType || 'text',
                                questionText: p.questionText,
                                answerText: p.answerText,
                                questionImages: p.questionImages || [],
                                answerImages: p.answerImages || [],
                                solutionVideoUrl: p.solutionVideoUrl,
                                difficulty: p.difficulty || 'Medium',
                                order: orderValue,
                                isSample: p.isSample || false,
                                description: p.description
                            }
                        });
                    }
                    else {
                        // Create new PYQ (without nested occurrences)
                        const newPYQ = await tx.pYQ.create({
                            data: {
                                lessonId,
                                questionType: p.questionType || 'text',
                                questionText: p.questionText,
                                answerText: p.answerText,
                                questionImages: p.questionImages || [],
                                answerImages: p.answerImages || [],
                                solutionVideoUrl: p.solutionVideoUrl,
                                difficulty: p.difficulty || 'Medium',
                                order: orderValue,
                                isSample: p.isSample || false,
                                description: p.description
                            }
                        });
                        pyqId = newPYQ.id;
                    }
                    // Collect occurrences for bulk insertion
                    if (p.occurrences && p.occurrences.length > 0) {
                        p.occurrences.forEach((o) => {
                            allOccurrences.push({
                                pyqId,
                                year: parseInt(o.year) || 0,
                                month: o.month || '',
                                courseCode: o.courseCode || '',
                                part: o.part || 'Part-A'
                            });
                        });
                    }
                }
                // Bulk insert all occurrences
                if (allOccurrences.length > 0) {
                    await tx.pYQOccurrence.createMany({
                        data: allOccurrences
                    });
                }
            }
            // 3. Update Quiz
            if (quiz) {
                const existing = await tx.quiz.findUnique({ where: { lessonId } });
                const quizResult = existing
                    ? await tx.quiz.update({
                        where: { id: existing.id },
                        data: {
                            title: quiz.title,
                            description: quiz.description,
                            isPublished: quiz.isPublished !== undefined ? quiz.isPublished : true
                        }
                    })
                    : await tx.quiz.create({
                        data: {
                            lessonId,
                            title: quiz.title,
                            description: quiz.description,
                            isPublished: quiz.isPublished !== undefined ? quiz.isPublished : true
                        }
                    });
                if (quiz.questions) {
                    await tx.question.deleteMany({ where: { quizId: quizResult.id } });
                    for (const q of quiz.questions) {
                        const questionResult = await tx.question.create({
                            data: {
                                quizId: quizResult.id,
                                type: q.type || 'mcq_single',
                                prompt: q.prompt,
                                order: q.order || 0,
                                numericValue: q.numericValue,
                                tolerance: q.tolerance
                            }
                        });
                        if (q.options && q.options.length > 0) {
                            await tx.mCQOption.createMany({
                                data: q.options.map((o) => ({
                                    questionId: questionResult.id,
                                    text: o.text,
                                    isCorrect: o.isCorrect || false
                                }))
                            });
                        }
                    }
                }
            }
            else if (quiz === null) {
                await tx.quiz.deleteMany({ where: { lessonId } });
            }
            // 4. Log the Audit Event
            await AuditService.logAction({
                actorUserId: adminId,
                action: 'UPDATE_LESSON_CONTENT',
                entityType: 'Lesson',
                entityId: lessonId,
                beforeState: { videosCount: videos?.length, pyqsCount: pyqs?.length, hasQuiz: !!quiz },
                afterState: { success: true }
            });
            console.log(`[updateLessonContent] Transaction completed successfully for lesson ${lessonId}`);
            return tx.lesson.findUnique({
                where: { id: lessonId },
                include: {
                    videos: { orderBy: { order: 'asc' } },
                    pyqs: {
                        include: { occurrences: true },
                        orderBy: { order: 'asc' }
                    },
                    quiz: {
                        include: {
                            questions: {
                                include: {
                                    options: true
                                },
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            });
        }, {
            timeout: 300000 // 5 minutes
        });
    }
    // --- Branch Management ---
    static async listBranches() {
        return prisma.branch.findMany({
            orderBy: { name: 'asc' }
        });
    }
    static async createBranch(adminId, name) {
        const branch = await prisma.branch.create({
            data: { name }
        });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'CREATE_BRANCH',
            entityType: 'Branch',
            entityId: branch.id,
            beforeState: null,
            afterState: branch
        });
        return branch;
    }
    static async updateBranch(adminId, id, name) {
        const before = await prisma.branch.findUnique({ where: { id } });
        if (!before)
            throw new Error('Branch not found');
        const after = await prisma.branch.update({
            where: { id },
            data: { name }
        });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'UPDATE_BRANCH',
            entityType: 'Branch',
            entityId: id,
            beforeState: before,
            afterState: after
        });
        return after;
    }
    static async deleteBranch(adminId, id) {
        const before = await prisma.branch.findUnique({ where: { id } });
        if (!before)
            throw new Error('Branch not found');
        await prisma.branch.delete({ where: { id } });
        await AuditService.logAction({
            actorUserId: adminId,
            action: 'DELETE_BRANCH',
            entityType: 'Branch',
            entityId: id,
            beforeState: before,
            afterState: null
        });
        return { success: true };
    }
    // --- PYQ Operations ---
    static async createPYQ(lessonId, data) {
        return prisma.pYQ.create({
            data: {
                ...data,
                lessonId,
                occurrences: {
                    create: (data.occurrences || []).map((o) => ({
                        year: parseInt(o.year) || 0,
                        month: o.month || '',
                        courseCode: o.courseCode || '',
                        part: o.part || 'Part-A'
                    }))
                }
            },
            include: { occurrences: true }
        });
    }
    static async updatePYQ(pyqId, data) {
        // Remove occurrences from direct data update to handle separately
        const { occurrences, lessonId, ...pyqData } = data;
        return prisma.pYQ.update({
            where: { id: pyqId },
            data: {
                ...pyqData,
                occurrences: occurrences ? {
                    deleteMany: {},
                    create: occurrences.map((o) => ({
                        year: parseInt(o.year) || 0,
                        month: o.month || '',
                        courseCode: o.courseCode || '',
                        part: o.part || 'Part-A'
                    }))
                } : undefined
            },
            include: { occurrences: true }
        });
    }
    static async deletePYQ(pyqId) {
        return prisma.pYQ.delete({
            where: { id: pyqId }
        });
    }
}
//# sourceMappingURL=adminService.js.map