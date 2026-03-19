import { EntityStatus } from '@prisma/client';
export declare class CourseService {
    static createCourse(title: string, description: string, basePrice: number, slug: string): Promise<{
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
    }>;
    static getCourses(status?: EntityStatus): Promise<({
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
    })[]>;
    static getCourseBySlug(slug: string): Promise<{
        _counts: {
            modules: number;
            lessons: number;
            videos: number;
            quizzes: number;
            pyqs: number;
        };
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
                quiz: {
                    id: string;
                    title: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    lessonId: string;
                    isPublished: boolean;
                } | null;
                pyqs: {
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
    } | null>;
    static getPublicCourse(slugOrId: string): Promise<{
        modules: {
            lessons: {
                videos: {
                    videoUrl: string | null;
                    id: string;
                    title: string;
                    order: number;
                    lessonId: string;
                    duration: number;
                    isSample: boolean;
                }[];
                pyqs: {
                    questionText: string | null;
                    questionImages: import("@prisma/client/runtime/library").JsonValue;
                    answerImages: import("@prisma/client/runtime/library").JsonValue;
                    solutionVideoUrl: string | null;
                    answerText: string | null;
                    occurrences: {
                        id: string;
                        courseCode: string;
                        year: number;
                        pyqId: string;
                        month: string;
                        part: string | null;
                    }[];
                    id: string;
                    description: string | null;
                    createdAt: Date;
                    order: number;
                    lessonId: string;
                    isPublished: boolean;
                    isSample: boolean;
                    questionType: string;
                    difficulty: string | null;
                    isSimilar: boolean;
                }[];
                quiz: {
                    id: string;
                } | null;
                id: string;
                title: string;
                version: number;
                updatedAt: Date;
                order: number;
                isDeleted: boolean;
                moduleId: string;
                isWrapper: boolean;
                completionRule: string;
            }[];
            id: string;
            title: string;
            order: number;
            courseId: string;
        }[];
        _counts: {
            modules: number;
            lessons: number;
            videos: number;
            quizzes: number;
            pyqs: number;
        };
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
    } | null>;
    static getCourseById(id: string): Promise<{
        _counts: {
            modules: number;
            lessons: number;
            videos: number;
            quizzes: number;
            pyqs: number;
        };
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
                quiz: {
                    id: string;
                    title: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    lessonId: string;
                    isPublished: boolean;
                } | null;
                pyqs: {
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
    } | null>;
    static updateCourse(id: string, data: any): Promise<{
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
    }>;
    static addModule(courseId: string, title: string, order: number): Promise<{
        id: string;
        title: string;
        order: number;
        courseId: string;
    }>;
    static addLesson(moduleId: string, title: string, order: number): Promise<{
        id: string;
        title: string;
        version: number;
        updatedAt: Date;
        order: number;
        isDeleted: boolean;
        moduleId: string;
        isWrapper: boolean;
        completionRule: string;
    }>;
    static updateLesson(lessonId: string, data: any): Promise<{
        id: string;
        title: string;
        version: number;
        updatedAt: Date;
        order: number;
        isDeleted: boolean;
        moduleId: string;
        isWrapper: boolean;
        completionRule: string;
    }>;
    static softDeleteLesson(lessonId: string): Promise<{
        id: string;
        title: string;
        version: number;
        updatedAt: Date;
        order: number;
        isDeleted: boolean;
        moduleId: string;
        isWrapper: boolean;
        completionRule: string;
    }>;
    static getAllBranches(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
    }[]>;
}
