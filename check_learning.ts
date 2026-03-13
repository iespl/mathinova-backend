import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
    const course = await p.course.findUnique({
        where: { slug: 'structural-engineering-theory-practice' },
        select: { learningPoints: true }
    });
    console.log(JSON.stringify(course, null, 2));
}
main().finally(() => p.$disconnect());
