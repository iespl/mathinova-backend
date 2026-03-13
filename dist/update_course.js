import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const updatedCourse = await prisma.course.update({
        where: { slug: 'advanced-structural-dynamics' },
        data: {
            title: 'Engineering Mathematics-II (BMATE201)',
            category: 'Math'
        }
    });
    console.log('--- Updated Course ---');
    console.log(JSON.stringify(updatedCourse, null, 2));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=update_course.js.map