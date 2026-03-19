import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                status: true
            }
        });

        console.log(`Found ${courses.length} courses:`);
        courses.forEach(c => {
            console.log(`- [${c.id}] ${c.title} (${c.slug}) [${c.status}]`);
        });

        const targetId = '12d474b4-db3d-4546-95cf-fde38f0b0f82';
        const target = courses.find(c => c.id === targetId);
        if (target) {
            console.log(`\nTARGET COURSE ${targetId} EXISTS IN DATABASE List.`);
        } else {
            console.log(`\nTARGET COURSE ${targetId} NOT FOUND IN DATABASE List.`);
        }

    } catch (error) {
        console.error('Error listing courses:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
