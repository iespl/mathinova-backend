import prisma from '../utils/prisma.js';
import { PaymentStatus, EnrollmentStatus } from '@prisma/client';
import { AuditService } from './auditService.js';

export class AdminService {
    /**
     * Atomic Refund Logic (Compliance v1.4.1)
     * Hardened with SERIALIZABLE isolation and direct enrollment resolution.
     */
    static async refundPayment(adminId: string, paymentId: string, reason: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Fetch current states for audit
            const paymentBefore = await tx.payment.findUnique({
                where: { id: paymentId },
                include: { order: true }
            });

            if (!paymentBefore) throw new Error('Payment not found');

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

    static async toggleUserStatus(adminId: string, userId: string, isActive: boolean) {
        const userBefore = await prisma.user.findUnique({ where: { id: userId } });
        if (!userBefore) throw new Error('User not found');

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

    static async createCourse(adminId: string, data: any) {
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

    static async updateCourse(adminId: string, courseId: string, data: any) {
        try {
            const before = await prisma.course.findUnique({ where: { id: courseId } });
            if (!before) throw new Error('Course not found');

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
        } catch (error: any) {
            console.error(`[AdminService.updateCourse] Failed for id ${courseId}:`, error);
            throw error;
        }
    }

    static async deleteCourse(adminId: string, courseId: string) {
        const before = await prisma.course.findUnique({ where: { id: courseId } });
        if (!before) throw new Error('Course not found');

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

    static async getCourseById(courseId: string) {
        return prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                videos: true,
                                pyqs: {
                                    include: {
                                        occurrences: true
                                    }
                                },
                                quiz: {
                                    include: {
                                        questions: {
                                            include: {
                                                options: true
                                            }
                                        }
                                    }
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

    // --- Content Operations (Modules/Lessons) ---
    static async addModule(courseId: string, title: string, order: number) {
        return prisma.module.create({
            data: { courseId, title, order }
        });
    }

    static async updateModule(adminId: string, moduleId: string, data: { title?: string, order?: number }) {
        const before = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!before) throw new Error('Module not found');

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

    static async deleteModule(adminId: string, moduleId: string) {
        const before = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!before) throw new Error('Module not found');

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

    static async addLesson(moduleId: string, title: string, order: number) {
        return prisma.lesson.create({
            data: { moduleId, title, order }
        });
    }

    static async deleteLesson(adminId: string, lessonId: string) {
        const before = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!before) throw new Error('Lesson not found');

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

    static async updateLesson(adminId: string, lessonId: string, data: { title?: string, order?: number, moduleId?: string }) {
        const before = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!before) throw new Error('Lesson not found');

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

    // --- Reordering Logic ---
    static async reorderModules(adminId: string, moduleIdOrders: { id: string, order: number }[]) {
        return prisma.$transaction(async (tx) => {
            const updates = moduleIdOrders.map(item =>
                tx.module.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            );
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

    static async reorderLessons(adminId: string, lessonIdOrders: { id: string, moduleId: string, order: number }[]) {
        return prisma.$transaction(async (tx) => {
            const updates = lessonIdOrders.map(item =>
                tx.lesson.update({
                    where: { id: item.id },
                    data: {
                        moduleId: item.moduleId,
                        order: item.order
                    }
                })
            );
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

    static async reorderVideos(adminId: string, videoIdOrders: { id: string, lessonId: string, order: number }[]) {
        return prisma.$transaction(async (tx) => {
            const updates = videoIdOrders.map(item =>
                tx.video.update({
                    where: { id: item.id },
                    data: {
                        lessonId: item.lessonId,
                        order: item.order
                    }
                })
            );
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

    static async reorderPYQs(adminId: string, pyqIdOrders: { id: string, lessonId: string, order: number }[]) {
        return prisma.$transaction(async (tx) => {
            const updates = pyqIdOrders.map(item =>
                tx.pYQ.update({
                    where: { id: item.id },
                    data: {
                        lessonId: item.lessonId,
                        order: item.order
                    }
                })
            );
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

    static async reorderQuizQuestions(adminId: string, questionIdOrders: { id: string, quizId: string, order: number }[]) {
        return prisma.$transaction(async (tx) => {
            const updates = questionIdOrders.map(item =>
                tx.question.update({
                    where: { id: item.id },
                    data: {
                        quizId: item.quizId,
                        order: item.order
                    }
                })
            );
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

    static async updateLessonContent(lessonId: string, videos?: any[], pyqs?: any[], quiz?: any) {
        return prisma.$transaction(async (tx) => {
            // 1. Update Videos

            // Better: Handle each video.
            if (videos) {
                await tx.video.deleteMany({ where: { lessonId } });
                if (videos.length > 0) {
                    await tx.video.createMany({
                        data: videos.map((v: any, idx: number) => ({
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

            // 2. Update PYQs
            if (pyqs) {
                await tx.pYQ.deleteMany({ where: { lessonId } });
                for (const p of pyqs) {
                    const pyqResult = await tx.pYQ.create({
                        data: {
                            lessonId,
                            questionType: p.questionType || 'text',
                            questionText: p.questionText,
                            answerText: p.answerText,
                            questionImages: p.questionImages || [],
                            answerImages: p.answerImages || [],
                            solutionVideoUrl: p.solutionVideoUrl,
                            difficulty: p.difficulty || 'Medium',
                            order: p.order || 0,
                            description: p.description
                        }
                    });

                    if (p.occurrences && p.occurrences.length > 0) {
                        await tx.pYQOccurrence.createMany({
                            data: p.occurrences.map((o: any) => ({
                                pyqId: pyqResult.id,
                                year: parseInt(o.year) || 0,
                                month: o.month || '',
                                courseCode: o.courseCode || '',
                                part: o.part || 'Part-A'
                            }))
                        });
                    }
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

                        if (q.options) {
                            await tx.mCQOption.createMany({
                                data: q.options.map((o: any) => ({
                                    questionId: questionResult.id,
                                    text: o.text,
                                    isCorrect: o.isCorrect || false
                                }))
                            });
                        }
                    }
                }
            } else if (quiz === null) {
                await tx.quiz.deleteMany({ where: { lessonId } });
            }

            return tx.lesson.findUnique({
                where: { id: lessonId },
                include: {
                    videos: true,
                    pyqs: true,
                    quiz: {
                        include: {
                            questions: {
                                include: {
                                    options: true
                                }
                            }
                        }
                    }
                }
            });
        });
    }

    // --- Branch Management ---
    static async listBranches() {
        return prisma.branch.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async createBranch(adminId: string, name: string) {
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

    static async updateBranch(adminId: string, id: string, name: string) {
        const before = await prisma.branch.findUnique({ where: { id } });
        if (!before) throw new Error('Branch not found');

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

    static async deleteBranch(adminId: string, id: string) {
        const before = await prisma.branch.findUnique({ where: { id } });
        if (!before) throw new Error('Branch not found');

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
}
