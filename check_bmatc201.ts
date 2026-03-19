import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const courseId = '12d474b4-db3d-4546-95cf-fde38f0b0f82';
    console.log(`--- Investigating Course ${courseId} ---`);
    
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            _count: {
                select: {
                    modules: true,
                    enrollments: true
                }
            },
            modules: {
                include: {
                    _count: {
                        select: {
                            lessons: true
                        }
                    },
                    lessons: {
                        include: {
                            _count: {
                                select: {
                                    videos: true,
                                    pyqs: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        console.log('Course NOT FOUND in database!');
        return;
    }

    console.log(`Title: ${course.title}`);
    console.log(`Code: ${course.courseCode}`);
    console.log(`Modules: ${course._count.modules}`);
    
    let totalLessons = 0;
    let totalVideos = 0;
    let totalPyqs = 0;

    course.modules.forEach(m => {
        totalLessons += m._count.lessons;
        m.lessons.forEach(l => {
            totalVideos += l._count.videos;
            totalPyqs += l._count.pyqs;
        });
    });

    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Total Videos: ${totalVideos}`);
    console.log(`Total PYQs: ${totalPyqs}`);

    // Check for any unusually large module/lesson clusters
    const maxLessonsInModule = Math.max(...course.modules.map(m => m._count.lessons), 0);
    console.log(`Max Lessons in a single module: ${maxLessonsInModule}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
