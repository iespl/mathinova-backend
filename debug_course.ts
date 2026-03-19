import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courseId = '12d474b4-db3d-4546-95cf-fde38f0b0f82';
    console.log(`Querying course: ${courseId}`);

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                videos: {
                                    orderBy: { order: 'asc' }
                                },
                                pyqs: {
                                    include: {
                                        occurrences: true
                                    },
                                    orderBy: { order: 'asc' }
                                },
                                quiz: {
                                    include: {
                                        questions: {
                                            include: {
                                                options: true
                                            },
                                            orderBy: { order: 'asc' }
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

        if (!course) {
            console.log('Course NOT FOUND');
        } else {
            console.log('Course FOUND:', course.title);
            console.log('Modules count:', course.modules.length);
        }
    } catch (error) {
        console.error('Error fetching course:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
