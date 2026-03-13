import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const enrollments = await prisma.enrollment.findMany({ take: 1 });
        console.log("Enrollment query successful");
        console.log(JSON.stringify(enrollments, null, 2));
    } catch (err: any) {
        console.error("Enrollment query failed:");
        console.error(err.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
