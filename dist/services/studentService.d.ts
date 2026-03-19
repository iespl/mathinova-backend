export declare class StudentService {
    static getEnrolledCourses(userId: string): Promise<{
        isExpired: boolean;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        course: {
            _count: {
                modules: number;
            };
        } & {
            id: string;
            title: string;
            slug: string;
            description: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            category: string;
            level: string;
            thumbnail: string | null;
            pricingType: import(".prisma/client").$Enums.PricingType;
            promoVideoUrl: string | null;
            validityDays: number | null;
            branch: string | null;
            subjectType: string | null;
            courseCode: string | null;
            longDescription: string | null;
            learningPoints: string[];
        };
        id: string;
        userId: string;
        expiresAt: Date | null;
        courseId: string;
        activatedAt: Date | null;
        enrollmentSource: string;
    }[]>;
    static enrollFree(userId: string, courseId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        userId: string;
        expiresAt: Date | null;
        courseId: string;
        activatedAt: Date | null;
        enrollmentSource: string;
    }>;
    static getCourseContent(userId: string, slugOrId: string): Promise<({
        modules: ({
            lessons: ({
                videos: {
                    id: string;
                    title: string;
                    order: number;
                    lessonId: string;
                    videoUrl: string;
                    duration: number;
                    isSample: boolean;
                }[];
                quiz: ({
                    questions: ({
                        options: {
                            id: string;
                            questionId: string;
                            text: string;
                            isCorrect: boolean;
                        }[];
                    } & {
                        id: string;
                        order: number;
                        quizId: string;
                        type: string;
                        prompt: string;
                        numericValue: number | null;
                        tolerance: number | null;
                    })[];
                } & {
                    id: string;
                    title: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    lessonId: string;
                    isPublished: boolean;
                }) | null;
                pyqs: ({
                    occurrences: {
                        id: string;
                        courseCode: string;
                        year: number;
                        pyqId: string;
                        month: string;
                        part: string | null;
                    }[];
                } & {
                    id: string;
                    description: string | null;
                    createdAt: Date;
                    order: number;
                    lessonId: string;
                    isPublished: boolean;
                    isSample: boolean;
                    questionType: string;
                    questionText: string | null;
                    questionImages: import("@prisma/client/runtime/library").JsonValue | null;
                    answerImages: import("@prisma/client/runtime/library").JsonValue | null;
                    solutionVideoUrl: string | null;
                    difficulty: string | null;
                    isSimilar: boolean;
                    answerText: string | null;
                })[];
                resources: {
                    id: string;
                    lessonId: string;
                    type: string;
                    fileUrl: string;
                }[];
            } & {
                id: string;
                title: string;
                version: number;
                updatedAt: Date;
                order: number;
                isDeleted: boolean;
                moduleId: string;
                isWrapper: boolean;
                completionRule: string;
            })[];
        } & {
            id: string;
            title: string;
            order: number;
            courseId: string;
        })[];
    } & {
        id: string;
        title: string;
        slug: string;
        description: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        category: string;
        level: string;
        thumbnail: string | null;
        pricingType: import(".prisma/client").$Enums.PricingType;
        promoVideoUrl: string | null;
        validityDays: number | null;
        branch: string | null;
        subjectType: string | null;
        courseCode: string | null;
        longDescription: string | null;
        learningPoints: string[];
    }) | null>;
    static updateVideoProgress(userId: string, lessonId: string, videoId: string, lastWatchedPosition: number): Promise<{
        id: string;
        userId: string;
        courseId: string;
        lessonId: string;
        completed: boolean;
        lastWatchedPosition: number;
        videoProgress: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    static recordQuizAttempt(userId: string, lessonId: string): Promise<{
        id: string;
        userId: string;
        courseId: string;
        lessonId: string;
        completed: boolean;
        lastWatchedPosition: number;
        videoProgress: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    static getLessonQuiz(userId: string, lessonId: string): Promise<({
        questions: ({
            options: {
                id: string;
                questionId: string;
                text: string;
                isCorrect: boolean;
            }[];
        } & {
            id: string;
            order: number;
            quizId: string;
            type: string;
            prompt: string;
            numericValue: number | null;
            tolerance: number | null;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        lessonId: string;
        isPublished: boolean;
    }) | null>;
    static startQuizAttempt(userId: string, quizId: string): Promise<{
        id: string;
        userId: string;
        quizId: string;
        startedAt: Date;
        submittedAt: Date | null;
        score: number | null;
    }>;
    static submitQuizAttempt(userId: string, quizId: string, attemptId: string, answers: any[]): Promise<{
        id: string;
        userId: string;
        quizId: string;
        startedAt: Date;
        submittedAt: Date | null;
        score: number | null;
    }>;
    static getLessonPYQs(userId: string, lessonId: string): Promise<({
        occurrences: {
            id: string;
            courseCode: string;
            year: number;
            pyqId: string;
            month: string;
            part: string | null;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        order: number;
        lessonId: string;
        isPublished: boolean;
        isSample: boolean;
        questionType: string;
        questionText: string | null;
        questionImages: import("@prisma/client/runtime/library").JsonValue | null;
        answerImages: import("@prisma/client/runtime/library").JsonValue | null;
        solutionVideoUrl: string | null;
        difficulty: string | null;
        isSimilar: boolean;
        answerText: string | null;
    })[]>;
    static trackPYQView(userId: string, pyqId: string): Promise<{
        id: string;
        userId: string;
        pyqId: string;
        viewedAt: Date;
    }>;
    private static computeLessonCompletion;
    static updateProgress(userId: string, lessonId: string, completed: boolean, lastWatchedPosition: number): Promise<{
        id: string;
        userId: string;
        courseId: string;
        lessonId: string;
        completed: boolean;
        lastWatchedPosition: number;
        videoProgress: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
