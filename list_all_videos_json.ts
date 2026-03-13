import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const slug = 'advanced-structural-dynamics';
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            videos: true
                        }
                    }
                }
            }
        }
    });
    console.log(JSON.stringify(course, null, 2));
}
main().finally(() => prisma.$disconnect());
