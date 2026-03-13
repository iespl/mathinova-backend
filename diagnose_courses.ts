
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Diagnosing Course Records...");

    // Check for "structural-engineering-theory-practice" slug
    const conflicts = await prisma.course.findMany({
        where: { slug: "structural-engineering-theory-practice" }
    });
    console.log(`Found ${conflicts.length} courses with slug 'structural-engineering-theory-practice':`);
    console.log(JSON.stringify(conflicts, null, 2));

    // Check for all courses
    const all = await prisma.course.findMany();
    console.log(`Total courses: ${all.length}`);
    console.log(JSON.stringify(all, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
