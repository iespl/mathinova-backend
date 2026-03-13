import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const slug = 'structural-engineering-theory-practice';
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        include: { videos: true, quiz: true, pyqs: true }
                    }
                }
            }
        }
    });
    console.log(JSON.stringify(course, null, 2));
}

main().finally(() => prisma.$disconnect());
