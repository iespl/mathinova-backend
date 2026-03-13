export declare class AdminService {
    /**
     * Atomic Refund Logic (Compliance v1.4.1)
     * Hardened with SERIALIZABLE isolation and direct enrollment resolution.
     */
    static refundPayment(adminId: string, paymentId: string, reason: string): Promise<{
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            gatewayReference: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            method: string;
            orderId: string;
        };
        enrollment: {
            id: string;
            status: import(".prisma/client").$Enums.EnrollmentStatus;
            userId: string;
            expiresAt: Date | null;
            courseId: string;
            activatedAt: Date | null;
            enrollmentSource: string;
        } | null;
    }>;
    static getOrders(): Promise<({
        user: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
            isActive: boolean;
            emailVerified: boolean;
        } | null;
        payments: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            gatewayReference: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            method: string;
            orderId: string;
        }[];
    } & {
        id: string;
        currency: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        email: string;
        userId: string | null;
        tempUserId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        couponId: string | null;
        courseId: string;
    })[]>;
    static getUsers(): Promise<{
        id: string;
        createdAt: Date;
        _count: {
            enrollments: number;
            orders: number;
        };
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
    }[]>;
    static toggleUserStatus(adminId: string, userId: string, isActive: boolean): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        updatedAt: Date;
        isActive: boolean;
        emailVerified: boolean;
    }>;
    static listCourses(): Promise<({
        _count: {
            enrollments: number;
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
        learningPoints: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    static createCourse(adminId: string, data: any): Promise<{
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
        learningPoints: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static updateCourse(adminId: string, courseId: string, data: any): Promise<{
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
        learningPoints: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static deleteCourse(adminId: string, courseId: string): Promise<{
        success: boolean;
    }>;
    static getCourseById(courseId: string): Promise<({
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
                    questionType: string;
                    questionText: string | null;
                    questionImages: import("@prisma/client/runtime/library").JsonValue | null;
                    answerImages: import("@prisma/client/runtime/library").JsonValue | null;
                    solutionVideoUrl: string | null;
                    difficulty: string | null;
                    isSimilar: boolean;
                    answerText: string | null;
                })[];
            } & {
                id: string;
                title: string;
                version: number;
                updatedAt: Date;
                order: number;
                isDeleted: boolean;
                isWrapper: boolean;
                completionRule: string;
                moduleId: string;
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
        learningPoints: import("@prisma/client/runtime/library").JsonValue | null;
    }) | null>;
    static addModule(courseId: string, title: string, order: number): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
    static updateModule(adminId: string, moduleId: string, data: {
        title?: string;
        order?: number;
    }): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
    static deleteModule(adminId: string, moduleId: string): Promise<{
        success: boolean;
    }>;
    static addLesson(moduleId: string, title: string, order: number): Promise<{
        id: string;
        title: string;
        version: number;
        updatedAt: Date;
        order: number;
        isDeleted: boolean;
        isWrapper: boolean;
        completionRule: string;
        moduleId: string;
    }>;
    static deleteLesson(adminId: string, lessonId: string): Promise<{
        success: boolean;
    }>;
    static updateLesson(adminId: string, lessonId: string, data: {
        title?: string;
        order?: number;
        moduleId?: string;
    }): Promise<{
        id: string;
        title: string;
        version: number;
        updatedAt: Date;
        order: number;
        isDeleted: boolean;
        isWrapper: boolean;
        completionRule: string;
        moduleId: string;
    }>;
    static reorderModules(adminId: string, moduleIdOrders: {
        id: string;
        order: number;
    }[]): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }[]>;
    static reorderLessons(adminId: string, lessonIdOrders: {
        id: string;
        moduleId: string;
        order: number;
    }[]): Promise<{
        id: string;
        title: string;
        version: number;
        updatedAt: Date;
        order: number;
        isDeleted: boolean;
        isWrapper: boolean;
        completionRule: string;
        moduleId: string;
    }[]>;
    static reorderVideos(adminId: string, videoIdOrders: {
        id: string;
        lessonId: string;
        order: number;
    }[]): Promise<{
        id: string;
        title: string;
        order: number;
        lessonId: string;
        videoUrl: string;
        duration: number;
        isSample: boolean;
    }[]>;
    static reorderPYQs(adminId: string, pyqIdOrders: {
        id: string;
        lessonId: string;
        order: number;
    }[]): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        order: number;
        lessonId: string;
        isPublished: boolean;
        questionType: string;
        questionText: string | null;
        questionImages: import("@prisma/client/runtime/library").JsonValue | null;
        answerImages: import("@prisma/client/runtime/library").JsonValue | null;
        solutionVideoUrl: string | null;
        difficulty: string | null;
        isSimilar: boolean;
        answerText: string | null;
    }[]>;
    static reorderQuizQuestions(adminId: string, questionIdOrders: {
        id: string;
        quizId: string;
        order: number;
    }[]): Promise<{
        id: string;
        order: number;
        quizId: string;
        type: string;
        prompt: string;
        numericValue: number | null;
        tolerance: number | null;
    }[]>;
    static updateLessonContent(lessonId: string, videos?: any[], pyqs?: any[], quiz?: any): Promise<({
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
            questionType: string;
            questionText: string | null;
            questionImages: import("@prisma/client/runtime/library").JsonValue | null;
            answerImages: import("@prisma/client/runtime/library").JsonValue | null;
            solutionVideoUrl: string | null;
            difficulty: string | null;
            isSimilar: boolean;
            answerText: string | null;
        })[];
    } & {
        id: string;
        title: string;
        version: number;
        updatedAt: Date;
        order: number;
        isDeleted: boolean;
        isWrapper: boolean;
        completionRule: string;
        moduleId: string;
    }) | null>;
    static listBranches(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
    }[]>;
    static createBranch(adminId: string, name: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
    }>;
    static updateBranch(adminId: string, id: string, name: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
    }>;
    static deleteBranch(adminId: string, id: string): Promise<{
        success: boolean;
    }>;
}
