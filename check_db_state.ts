import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.count();
    const branches = await prisma.branch.findMany();
    const courses = await prisma.course.findMany();

    console.log('--- Stats ---');
    console.log('Users:', users);
    console.log('Branches in DB:', JSON.stringify(branches.map(b => b.name), null, 2));
    console.log('Courses count:', courses.length);
    if (courses.length > 0) {
        console.log('Sample Course:', JSON.stringify(courses[0], null, 2));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
