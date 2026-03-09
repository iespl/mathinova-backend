
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'verify_routing@mathinova.com';
    const password = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Routing Tester',
            passwordHash: password,
            role: 'student'
        }
    });

    console.log(`User created/found: ${user.email}`);

    // Also enroll in the struct eng course
    const course = await prisma.course.findUnique({ where: { slug: 'structural-engineering-theory-practice' } });
    if (course) {
        await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: user.id, courseId: course.id } },
            update: { status: 'active' },
            create: {
                userId: user.id,
                courseId: course.id,
                status: 'active'
            }
        });
        console.log('Enrolled in course');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
