
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.course.count();
    console.log(`Course count: ${count}`);
    if (count > 0) {
        const courses = await prisma.course.findMany({ select: { id: true, title: true } });
        console.log('Existing courses:', courses);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
