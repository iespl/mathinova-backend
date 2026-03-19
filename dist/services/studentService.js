import prisma from '../utils/prisma.js';
import { EnrollmentStatus } from '@prisma/client';
export class StudentService {
    static async getEnrolledCourses(userId) {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                status: { in: [EnrollmentStatus.active, EnrollmentStatus.expired] }
            },
            include: {
                course: {
                    include: {
                        _count: { select: { modules: true } }
                    }
                }
            }
        });
        // Add isExpired flag to each enrollment
        return enrollments.map(enrollment => {
            const now = new Date();
            const isExpired = enrollment.expiresAt !== null && enrollment.expiresAt < now;
            return {
                ...enrollment,
                isExpired,
                // Update status to 'expired' if it's past expiry date
                status: isExpired ? EnrollmentStatus.expired : enrollment.status
            };
        });
    }
    static async enrollFree(userId, courseId) {
        // 1. Verify Course is Free
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { pricingType: true }
        });
        if (!course)
            throw new Error('Course not found');
        if (course.pricingType !== 'free') {
            throw new Error('This course is not free. Please complete payment to enroll.');
        }
        // 2. Create/Update Enrollment
        return prisma.enrollment.upsert({
            where: {
                userId_courseId: { userId, courseId }
            },
            update: {
                status: EnrollmentStatus.active,
                activatedAt: new Date(),
                enrollmentSource: 'free'
            },
            create: {
                userId,
                courseId,
                status: EnrollmentStatus.active,
                activatedAt: new Date(),
                enrollmentSource: 'free'
            }
        });
    }
    static async getCourseContent(userId, slugOrId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
        // 1. Check Enrollment by resolving UUID or slug
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                course: isUuid ? { id: slugOrId } : { slug: slugOrId }
            }
        });
        if (!enrollment || enrollment.status !== 'active') {
            throw new Error('Access Denied: You are not enrolled in this course.');
        }
        // 2. Check if enrollment is expired
        const now = new Date();
        if (enrollment.expiresAt !== null && enrollment.expiresAt < now) {
            throw new Error('Access Expired: Your enrollment has expired. Please renew to continue learning.');
        }
        const resolvedCourseId = enrollment.courseId;
        // 3. Fetch Full Content (including videos, quiz, pyqs)
        return prisma.course.findUnique({
            where: { id: resolvedCourseId },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            where: { isDeleted: false },
                            orderBy: { order: 'asc' },
                            include: {
                                videos: {
                                    orderBy: { order: 'asc' }
                                },
                                resources: true,
                                quiz: {
                                    include: {
                                        questions: {
                                            include: { options: true },
                                            orderBy: { order: 'asc' }
                                        }
                                    }
                                },
                                pyqs: {
                                    include: { occurrences: true },
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    static async updateVideoProgress(userId, lessonId, videoId, lastWatchedPosition) {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true, videos: true }
        });
        if (!lesson)
            throw new Error('Lesson not found');
        const video = lesson.videos.find(v => v.id === videoId);
        if (!video)
            throw new Error('Video not found in this lesson');
        // Calculate percentage
        const percent = Math.min(100, Math.floor((lastWatchedPosition / video.duration) * 100));
        const isWatched = percent >= 90;
        const currentProgress = await prisma.progress.findUnique({
            where: { userId_lessonId: { userId, lessonId } }
        });
        let videoProgress = currentProgress?.videoProgress || {};
        videoProgress[videoId] = { watched: isWatched, percent };
        await prisma.progress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: {
                videoProgress,
                lastWatchedPosition
            },
            create: {
                userId,
                lessonId,
                courseId: lesson.module.courseId,
                videoProgress,
                lastWatchedPosition
            }
        });
        return this.computeLessonCompletion(userId, lessonId, lesson);
    }
    static async recordQuizAttempt(userId, lessonId) {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true, videos: true }
        });
        if (!lesson)
            throw new Error('Lesson not found');
        return this.computeLessonCompletion(userId, lessonId, lesson);
    }
    static async getLessonQuiz(userId, lessonId) {
        // 1. Verify Enrollment
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });
        if (!lesson)
            throw new Error('Lesson not found');
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.module.courseId } }
        });
        if (!enrollment || enrollment.status !== 'active') {
            throw new Error('Access Denied: Enrollment required to access quizzes.');
        }
        return prisma.quiz.findUnique({
            where: { lessonId },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });
    }
    static async startQuizAttempt(userId, quizId) {
        return prisma.quizAttempt.create({
            data: { userId, quizId, startedAt: new Date() }
        });
    }
    static async submitQuizAttempt(userId, quizId, attemptId, answers) {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { include: { options: true } } }
        });
        if (!quiz)
            throw new Error('Quiz not found');
        let totalQuestions = quiz.questions.length;
        let correctCount = 0;
        // 1. Process Answers and Grade
        const questionAttempts = [];
        for (const question of quiz.questions) {
            const userAnswer = answers.find(a => a.questionId === question.id);
            let isCorrect = false;
            if (userAnswer) {
                if (question.type === 'mcq_single' || question.type === 'mcq_multiple') {
                    const correctOptionIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
                    const selectedIds = userAnswer.selectedOptions || [];
                    isCorrect = correctOptionIds.length === selectedIds.length &&
                        correctOptionIds.every((id) => selectedIds.includes(id));
                }
                else if (question.type === 'numeric') {
                    const val = userAnswer.numericAnswer;
                    const correct = question.numericValue || 0;
                    const tol = question.tolerance || 0.01;
                    isCorrect = Math.abs(val - (correct || 0)) <= (tol || 0.01);
                }
                if (isCorrect)
                    correctCount++;
                questionAttempts.push({
                    questionId: question.id,
                    selectedOptions: userAnswer.selectedOptions,
                    numericAnswer: userAnswer.numericAnswer
                });
            }
        }
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        // 2. Update QuizAttempt
        const updatedAttempt = await prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
                submittedAt: new Date(),
                score,
                answers: {
                    create: questionAttempts.map(a => ({
                        questionId: a.questionId,
                        selectedOptions: a.selectedOptions,
                        numericAnswer: a.numericAnswer
                    }))
                }
            }
        });
        // 3. Trigger Completion Re-calculation
        const lessonWithVideos = await prisma.lesson.findUnique({
            where: { id: quiz.lessonId },
            include: { module: true, videos: true }
        });
        // Ensure progress record exists
        await prisma.progress.upsert({
            where: { userId_lessonId: { userId, lessonId: quiz.lessonId } },
            update: {},
            create: {
                userId,
                lessonId: quiz.lessonId,
                courseId: lessonWithVideos?.module.courseId || ''
            }
        });
        await this.computeLessonCompletion(userId, quiz.lessonId, lessonWithVideos);
        return updatedAttempt;
    }
    static async getLessonPYQs(userId, lessonId) {
        // 1. Verify Enrollment
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });
        if (!lesson)
            throw new Error('Lesson not found');
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.module.courseId } }
        });
        if (!enrollment || enrollment.status !== 'active') {
            throw new Error('Access Denied: Enrollment required to access PYQs.');
        }
        return prisma.pYQ.findMany({
            where: { lessonId, isPublished: true },
            orderBy: [{ order: 'asc' }],
            include: { occurrences: true }
        });
    }
    static async trackPYQView(userId, pyqId) {
        return prisma.pYQView.create({
            data: { userId, pyqId }
        });
    }
    static async computeLessonCompletion(userId, lessonId, lesson) {
        const progress = await prisma.progress.findUnique({
            where: { userId_lessonId: { userId, lessonId } }
        });
        if (!progress)
            return null;
        // Completion Rules logic
        const rule = lesson.completionRule || "video+quiz";
        // Video check
        const videoProgress = progress.videoProgress || {};
        const allVideosWatched = lesson.videos.length === 0 || lesson.videos.every((v) => videoProgress[v.id]?.watched === true);
        // Quiz check
        const quiz = await prisma.quiz.findUnique({ where: { lessonId } });
        let quizSubmitted = false;
        if (quiz) {
            const attempt = await prisma.quizAttempt.findFirst({
                where: { userId, quizId: quiz.id, submittedAt: { not: null } }
            });
            quizSubmitted = !!attempt;
        }
        else {
            quizSubmitted = true;
        }
        let completed = false;
        if (rule === "video_only") {
            completed = allVideosWatched;
        }
        else if (rule === "quiz_only") {
            completed = quizSubmitted;
        }
        else {
            completed = allVideosWatched && quizSubmitted;
        }
        return prisma.progress.update({
            where: { id: progress.id },
            data: { completed }
        });
    }
    static async updateProgress(userId, lessonId, completed, lastWatchedPosition) {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });
        if (!lesson)
            throw new Error('Lesson not found');
        return prisma.progress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { completed, lastWatchedPosition },
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
//# sourceMappingURL=studentService.js.map