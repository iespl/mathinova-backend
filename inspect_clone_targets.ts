import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const SOURCE_COURSE_ID = '12d474b4-db3d-4546-95cf-fde38f0b0f82';
const TARGET_COURSE_ID = '2f23669d-9113-48d1-887c-c843bea57725';

async function main() {
    // Source course - find the lesson
    const sourceCourse = await prisma.course.findUnique({
        where: { id: SOURCE_COURSE_ID },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: { _count: { select: { pyqs: true, videos: true } } }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!sourceCourse) { console.log('Source course not found'); return; }
    console.log(`\n📚 SOURCE: ${sourceCourse.title}`);
    for (const mod of sourceCourse.modules) {
        console.log(`  Module [${mod.id}]: ${mod.title}`);
        for (const lesson of mod.lessons) {
            console.log(`    Lesson [${lesson.id}]: ${lesson.title} | videos:${lesson._count.videos} pyqs:${lesson._count.pyqs}`);
        }
    }

    // Target course - find Module 4: Numerical Methods - 1
    const targetCourse = await prisma.course.findUnique({
        where: { id: TARGET_COURSE_ID },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: { _count: { select: { pyqs: true, videos: true } } }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!targetCourse) { console.log('Target course not found'); return; }
    console.log(`\n📚 TARGET: ${targetCourse.title}`);
    for (const mod of targetCourse.modules) {
        console.log(`  Module [${mod.id}]: ${mod.title}`);
        for (const lesson of mod.lessons) {
            console.log(`    Lesson [${lesson.id}]: ${lesson.title} | videos:${lesson._count.videos} pyqs:${lesson._count.pyqs}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
