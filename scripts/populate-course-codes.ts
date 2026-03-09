
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Use raw query because client types might be stale
    // We want to find courses where courseCode is null
    // But wait, if types are stale, we can't use `findMany` with `where: { courseCode: null }`?
    // Yes we can, if courseCode is optional in schema.prisma and we generated client BEFORE adding it? No.
    // If we skipped generate, the client doesn't know about courseCode.
    // So we must use raw SQL for selecting too!

    const courses: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Course" WHERE "courseCode" IS NULL`);
    console.log(`Found ${courses.length} courses without courseCode.`);

    for (const course of courses) {
        const code = course.slug.toUpperCase().slice(0, 10);
        console.log(`Updating course ${course.title} with code ${code}`);
        await prisma.$executeRawUnsafe(`UPDATE "Course" SET "courseCode" = '${code}' WHERE "id" = '${course.id}'`);
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
