export declare class StudentService {
    static getEnrolledCourses(userId: string): Promise<({
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EnrollmentStatus;
        userId: string;
        expiresAt: Date | null;
        courseId: string;
        activatedAt: Date | null;
        enrollmentSource: string;
    })[]>;
    static getCourseContent(userId: string, courseId: string): Promise<({
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
