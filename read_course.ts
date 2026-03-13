import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
    const course = await p.course.findFirst({
        where: { slug: 'structural-engineering-theory-practice' },
    });
    console.log(JSON.stringify(course, null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
