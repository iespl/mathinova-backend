import prisma from './src/utils/prisma.js';

async function check() {
    try {
        const freePyqs = await prisma.pYQ.findMany({
            where: { isSample: true },
            include: {
                lesson: {
                    include: {
                        module: {
                            include: {
                                course: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`Found ${freePyqs.length} free PYQs.`);
        freePyqs.forEach(p => {
            console.log(`PYQ ID: ${p.id}, Lesson: ${p.lesson.title}, Course: ${p.lesson.module.course.slug}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
