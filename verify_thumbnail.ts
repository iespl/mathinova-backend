
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const course = await prisma.course.findUnique({
        where: { slug: 'advanced-structural-dynamics' },
        select: { title: true, thumbnail: true }
    });

    console.log(`Course: "${course?.title}"`);
    console.log(`Thumbnail: ${course?.thumbnail}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
