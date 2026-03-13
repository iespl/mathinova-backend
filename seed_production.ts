
import { PrismaClient, PricingType } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface VideoManifest {
    id: string;
    videoUrl: string;
    duration: number; // Mandatory
    title: string;    // Mandatory
    isSample?: boolean;
}

interface MCQOptionManifest {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface QuestionManifest {
    id: string;
    type: string;
    prompt: string;
    order: number;
    numericValue?: number;
    tolerance?: number;
    options?: MCQOptionManifest[];
}

interface QuizManifest {
    id: string;
    title: string;
    description?: string;
    isPublished?: boolean;
    questions: QuestionManifest[];
}

interface PYQOccurrenceManifest {
    year: number;
    month: string;
    courseCode: string;
}

interface PYQManifest {
    id: string;
    questionType: string;
    questionText?: string;
    questionImages?: string[];
    answerImages?: string[];
    solutionVideoUrl?: string;
    difficulty?: string;
    order: number;
    isSimilar?: boolean;
    isPublished?: boolean;
    description?: string;
    occurrences: PYQOccurrenceManifest[];
}

interface LessonManifest {
    id: string;
    title: string;
    order: number;
    completionRule?: string; // "video_only" | "quiz_only" | "video+quiz"
    videos?: VideoManifest[];
    quiz?: QuizManifest;
    pyqs?: PYQManifest[];
}

interface ModuleManifest {
    id: string;
    title: string;
    order: number;
    lessons?: LessonManifest[];
    videos?: VideoManifest[]; // Shorthand for Wrapper Lesson
}

interface CourseManifest {
    id: string;
    title: string;
    slug: string;
    description: string;
    basePrice: number;
    currency: string;
    status: 'draft' | 'published';
    category?: string;
    level?: string;
    thumbnail?: string;
    pricingType?: string;
    modules?: ModuleManifest[];
}

interface ContentManifest {
    manifestVersion: string;
    courses: CourseManifest[];
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function generateStableUUID(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex').substring(0, 8) +
        '-' + crypto.createHash('md5').update(input).digest('hex').substring(8, 12) +
        '-4' + crypto.createHash('md5').update(input).digest('hex').substring(13, 16) +
        '-a' + crypto.createHash('md5').update(input).digest('hex').substring(17, 20) +
        '-' + crypto.createHash('md5').update(input).digest('hex').substring(20, 32);
}

async function processCourse(tx: any, courseData: CourseManifest, actionLog: string[]) {
    if (!courseData.id) throw new Error(`Course "${courseData.title}" missing ID`);

    logAction(actionLog, `UPSERT Course: ${courseData.title} (${courseData.id}) Slug: ${courseData.slug}`);
    console.log(`UPSERTING: ${courseData.id} | ${courseData.slug}`);

    if (tx) {
        await tx.course.upsert({
            where: { id: courseData.id },
            update: {
                title: courseData.title,
                slug: courseData.slug,
                description: courseData.description,
                basePrice: courseData.basePrice,
                currency: courseData.currency,
                status: courseData.status as any,
                category: courseData.category || "Engineering",
                level: courseData.level || "Professional",
                thumbnail: courseData.thumbnail,
                pricingType: (courseData.pricingType as PricingType) || PricingType.paid
            },
            create: {
                id: courseData.id,
                title: courseData.title,
                slug: courseData.slug,
                description: courseData.description,
                basePrice: courseData.basePrice,
                currency: courseData.currency,
                status: courseData.status as any,
                category: courseData.category || "Engineering",
                level: courseData.level || "Professional",
                thumbnail: courseData.thumbnail,
                pricingType: (courseData.pricingType as PricingType) || PricingType.paid
            }
        });
    }

    for (const mod of courseData.modules || []) {
        logAction(actionLog, `  UPSERT Module: ${mod.title} (${mod.id})`);
        if (tx) {
            await tx.module.upsert({
                where: { id: mod.id },
                update: { title: mod.title, order: mod.order },
                create: { id: mod.id, courseId: courseData.id, title: mod.title, order: mod.order }
            });
        }

        for (const lesson of mod.lessons || []) {
            logAction(actionLog, `    UPSERT Lesson: ${lesson.title} (${lesson.id})`);
            if (tx) {
                await tx.lesson.upsert({
                    where: { id: lesson.id },
                    update: {
                        title: lesson.title,
                        order: lesson.order,
                        isWrapper: false,
                        completionRule: lesson.completionRule || "video+quiz"
                    },
                    create: {
                        id: lesson.id,
                        moduleId: mod.id,
                        title: lesson.title,
                        order: lesson.order,
                        isWrapper: false,
                        completionRule: lesson.completionRule || "video+quiz"
                    }
                });
            }
            await processVideos(tx, lesson.id, lesson.videos || [], actionLog);

            if (lesson.quiz) {
                await processQuiz(tx, lesson.id, lesson.quiz, actionLog);
            }
            if (lesson.pyqs) {
                await processPYQs(tx, lesson.id, lesson.pyqs, actionLog);
            }
        }

        if (mod.videos && mod.videos.length > 0) {
            const wrapperId = generateStableUUID(mod.id + '-wrapper');
            logAction(actionLog, `    UPSERT WRAPPER Lesson (Hiding from UI): ${mod.title} (${wrapperId})`);
            if (tx) {
                await tx.lesson.upsert({
                    where: { id: wrapperId },
                    update: { title: mod.title, order: 9999, isWrapper: true, completionRule: "video_only" },
                    create: { id: wrapperId, moduleId: mod.id, title: mod.title, order: 1, isWrapper: true, completionRule: "video_only" }
                });
            }
            await processVideos(tx, wrapperId, mod.videos, actionLog);
        }
    }
}

async function processQuiz(tx: any, lessonId: string, quiz: QuizManifest, logs: string[]) {
    logAction(logs, `      UPSERT Quiz: ${quiz.title} (${quiz.id})`);
    if (tx) {
        await tx.quiz.upsert({
            where: { id: quiz.id },
            update: { title: quiz.title, description: quiz.description, isPublished: quiz.isPublished ?? true },
            create: { id: quiz.id, lessonId, title: quiz.title, description: quiz.description, isPublished: quiz.isPublished ?? true }
        });
    }

    for (const q of quiz.questions) {
        if (tx) {
            await tx.question.upsert({
                where: { id: q.id },
                update: { type: q.type, prompt: q.prompt, order: q.order, numericValue: q.numericValue, tolerance: q.tolerance },
                create: { id: q.id, quizId: quiz.id, type: q.type, prompt: q.prompt, order: q.order, numericValue: q.numericValue, tolerance: q.tolerance }
            });
        }

        if (q.options) {
            for (const opt of q.options) {
                if (tx) {
                    await tx.mCQOption.upsert({
                        where: { id: opt.id },
                        update: { text: opt.text, isCorrect: opt.isCorrect },
                        create: { id: opt.id, questionId: q.id, text: opt.text, isCorrect: opt.isCorrect }
                    });
                }
            }
        }
    }
}

async function processPYQs(tx: any, lessonId: string, pyqs: PYQManifest[], logs: string[]) {
    for (const pyq of pyqs) {
        logAction(logs, `      UPSERT PYQ: ${pyq.id}`);
        if (tx) {
            await tx.pYQ.upsert({
                where: { id: pyq.id },
                update: {
                    questionType: pyq.questionType,
                    questionText: pyq.questionText,
                    questionImages: pyq.questionImages,
                    answerImages: pyq.answerImages,
                    solutionVideoUrl: pyq.solutionVideoUrl,
                    difficulty: pyq.difficulty,
                    order: pyq.order,
                    isSimilar: pyq.isSimilar ?? false,
                    isPublished: pyq.isPublished ?? true,
                    description: pyq.description
                },
                create: {
                    id: pyq.id,
                    lessonId,
                    questionType: pyq.questionType,
                    questionText: pyq.questionText,
                    questionImages: pyq.questionImages,
                    answerImages: pyq.answerImages,
                    solutionVideoUrl: pyq.solutionVideoUrl,
                    difficulty: pyq.difficulty,
                    order: pyq.order,
                    isSimilar: pyq.isSimilar ?? false,
                    isPublished: pyq.isPublished ?? true,
                    description: pyq.description
                }
            });
        }

        for (const occ of pyq.occurrences) {
            const occId = generateStableUUID(`${pyq.id}-${occ.year}-${occ.month}-${occ.courseCode}`);
            if (tx) {
                await tx.pYQOccurrence.upsert({
                    where: { id: occId },
                    update: { year: occ.year, month: occ.month, courseCode: occ.courseCode },
                    create: { id: occId, pyqId: pyq.id, year: occ.year, month: occ.month, courseCode: occ.courseCode }
                });
            }
        }
    }
}

async function processVideos(tx: any, lessonId: string, videos: VideoManifest[], logs: string[]) {
    for (const vid of videos) {
        if (!vid.title) throw new Error(`Video missing TITLE (Lesson: ${lessonId}, URL: ${vid.videoUrl}). Title is mandatory for playlist UX.`);

        logAction(logs, `      UPSERT Video: ${vid.id} - ${vid.title}`);
        if (tx) {
            await (tx.video as any).upsert({
                where: { id: vid.id },
                update: {
                    title: vid.title,
                    videoUrl: vid.videoUrl,
                    duration: vid.duration || 0,
                    isSample: vid.isSample ?? false
                } as any,
                create: {
                    id: vid.id,
                    lessonId: lessonId,
                    title: vid.title,
                    videoUrl: vid.videoUrl,
                    duration: vid.duration || 0,
                    isSample: vid.isSample ?? false
                } as any
            });
        }
    }
}

function logAction(logs: string[], msg: string) {
    logs.push(msg);
}

async function main() {
    console.log(`🚀 Starting Production Content Ingestion ${DRY_RUN ? '(DRY RUN)' : ''}...`);

    const manifestPath = path.join(__dirname, 'content_manifest.json');
    if (!fs.existsSync(manifestPath)) throw new Error('content_manifest.json not found!');

    const manifest: ContentManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    if (!DRY_RUN) {
        const existingLog = await prisma.contentIngestionLog.findFirst({
            where: { manifestVersion: manifest.manifestVersion, status: 'SUCCESS' }
        });
        if (existingLog) {
            console.log(`⚠️  Version "${manifest.manifestVersion}" already ingested. Skipping.`);
            return;
        }
    }

    const actionLog: string[] = [];
    let isSuccess = true;

    try {
        for (const courseData of manifest.courses) {
            if (DRY_RUN) {
                await processCourse(null, courseData, actionLog);
            } else {
                console.log(`📦 Ingesting Course: ${courseData.title} (Atomic Transaction)`);
                await prisma.$transaction(async (tx) => {
                    await processCourse(tx, courseData, actionLog);
                }, { timeout: 120000 });
            }
        }
    } catch (error) {
        console.error('❌ Ingestion Failed:', error);
        actionLog.push(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
        isSuccess = false;
        process.exitCode = 1;
    } finally {
        if (!DRY_RUN) {
            await prisma.contentIngestionLog.create({
                data: {
                    manifestVersion: manifest.manifestVersion,
                    status: isSuccess ? 'SUCCESS' : 'FAILED',
                    details: { logs: actionLog }
                }
            });
        } else {
            actionLog.forEach(l => console.log(l));
        }
    }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => {
    if (!DRY_RUN) await prisma.$disconnect();
});
