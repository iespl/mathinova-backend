import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
const prisma = new PrismaClient();
async function main() {
    const manifestPath = path.join(process.cwd(), 'content_manifest.json');
    console.log(`Reading manifest from ${manifestPath}`);
    if (!fs.existsSync(manifestPath)) {
        console.error('Manifest file not found!');
        return;
    }
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(`Found ${data.courses.length} courses in manifest version ${data.manifestVersion}`);
    for (const courseData of data.courses) {
        console.log(`Processing course: ${courseData.title} (${courseData.id})`);
        // Upsert Course
        const course = await prisma.course.upsert({
            where: { id: courseData.id },
            update: {
                title: courseData.title,
                slug: courseData.slug,
                description: courseData.description,
                thumbnail: courseData.thumbnail,
                basePrice: courseData.basePrice,
                currency: courseData.currency,
                status: courseData.status, // Ensure enum match or map it
                pricingType: courseData.pricingType,
                promoVideoUrl: courseData.promoVideoUrl,
                validityDays: courseData.validityDays
            },
            create: {
                id: courseData.id,
                title: courseData.title,
                slug: courseData.slug,
                description: courseData.description,
                thumbnail: courseData.thumbnail,
                basePrice: courseData.basePrice,
                currency: courseData.currency || "INR",
                status: courseData.status || "draft",
                pricingType: courseData.pricingType || "paid",
                promoVideoUrl: courseData.promoVideoUrl,
                validityDays: courseData.validityDays
            }
        });
        // Modules
        if (courseData.modules) {
            for (const modData of courseData.modules) {
                await prisma.module.upsert({
                    where: { id: modData.id },
                    update: {
                        title: modData.title,
                        order: modData.order,
                        courseId: course.id
                    },
                    create: {
                        id: modData.id,
                        title: modData.title,
                        order: modData.order,
                        courseId: course.id
                    }
                });
                // Lessons
                if (modData.lessons) {
                    for (const lsnData of modData.lessons) {
                        const lesson = await prisma.lesson.upsert({
                            where: { id: lsnData.id },
                            update: {
                                title: lsnData.title,
                                order: lsnData.order,
                                moduleId: modData.id
                            },
                            create: {
                                id: lsnData.id,
                                title: lsnData.title,
                                order: lsnData.order,
                                moduleId: modData.id
                            }
                        });
                        // Videos
                        if (lsnData.videos) {
                            for (const vidData of lsnData.videos) {
                                await prisma.video.upsert({
                                    where: { id: vidData.id },
                                    update: {
                                        title: vidData.title,
                                        videoUrl: vidData.videoUrl,
                                        duration: vidData.duration,
                                        isSample: vidData.isSample || false,
                                        lessonId: lesson.id
                                    },
                                    create: {
                                        id: vidData.id,
                                        title: vidData.title,
                                        videoUrl: vidData.videoUrl,
                                        duration: vidData.duration,
                                        isSample: vidData.isSample || false,
                                        lessonId: lesson.id
                                    }
                                });
                            }
                        }
                        // Quizzes
                        if (lsnData.quiz) {
                            const quizData = lsnData.quiz;
                            const quiz = await prisma.quiz.upsert({
                                where: { lessonId: lesson.id }, // Assuming 1 quiz per lesson as per schema unique constraint
                                update: {
                                    id: quizData.id, // Explicitly set ID if provided, though typically we match on unique lessonId
                                    title: quizData.title,
                                    description: quizData.description
                                },
                                create: {
                                    id: quizData.id,
                                    lessonId: lesson.id,
                                    title: quizData.title,
                                    description: quizData.description
                                }
                            });
                            if (quizData.questions) {
                                for (const qData of quizData.questions) {
                                    const question = await prisma.question.upsert({
                                        where: { id: qData.id },
                                        update: {
                                            quizId: quiz.id,
                                            type: qData.type,
                                            prompt: qData.prompt,
                                            order: qData.order,
                                            numericValue: qData.numericValue,
                                            tolerance: qData.tolerance
                                        },
                                        create: {
                                            id: qData.id,
                                            quizId: quiz.id,
                                            type: qData.type,
                                            prompt: qData.prompt,
                                            order: qData.order,
                                            numericValue: qData.numericValue,
                                            tolerance: qData.tolerance
                                        }
                                    });
                                    if (qData.options) {
                                        // Simple options handling: delete existing and recreate to avoid syncing complex IDs if not critical
                                        // OR upsert if IDs are stable. Manifest has IDs like "o1-1".
                                        for (const optData of qData.options) {
                                            await prisma.mCQOption.upsert({
                                                where: { id: optData.id },
                                                update: {
                                                    text: optData.text,
                                                    isCorrect: optData.isCorrect,
                                                    questionId: question.id
                                                },
                                                create: {
                                                    id: optData.id,
                                                    text: optData.text,
                                                    isCorrect: optData.isCorrect,
                                                    questionId: question.id
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        // PYQs
                        if (lsnData.pyqs) {
                            for (const pyqData of lsnData.pyqs) {
                                await prisma.pYQ.upsert({
                                    where: { id: pyqData.id },
                                    update: {
                                        lessonId: lesson.id,
                                        questionType: pyqData.questionType,
                                        questionText: pyqData.questionText,
                                        questionImages: pyqData.questionImages || [],
                                        answerImages: pyqData.answerImages || [],
                                        solutionVideoUrl: pyqData.solutionVideoUrl,
                                        difficulty: pyqData.difficulty,
                                        order: pyqData.order,
                                        description: pyqData.description
                                    },
                                    create: {
                                        id: pyqData.id,
                                        lessonId: lesson.id,
                                        questionType: pyqData.questionType,
                                        questionText: pyqData.questionText,
                                        questionImages: pyqData.questionImages || [],
                                        answerImages: pyqData.answerImages || [],
                                        solutionVideoUrl: pyqData.solutionVideoUrl,
                                        difficulty: pyqData.difficulty,
                                        order: pyqData.order,
                                        description: pyqData.description
                                    }
                                });
                                // Handle occurrences if present? Manifest example had occurrences.
                                if (pyqData.occurrences) {
                                    // Occurrences don't have stable IDs in manifest usually (check file).
                                    // Manifest: "occurrences": [{ "year": 2022, ... }] (no ID).
                                    // Logic: Delete all for this PYQ and recreate.
                                    await prisma.pYQOccurrence.deleteMany({ where: { pyqId: pyqData.id } });
                                    for (const occ of pyqData.occurrences) {
                                        await prisma.pYQOccurrence.create({
                                            data: {
                                                pyqId: pyqData.id,
                                                year: occ.year,
                                                month: occ.month,
                                                courseCode: occ.courseCode
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    console.log('Ingestion complete.');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=ingest_manifest.js.map