import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            category: true
        }
    });
    console.log('--- Current Courses ---');
    console.log(JSON.stringify(courses, null, 2));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check_courses.js.map