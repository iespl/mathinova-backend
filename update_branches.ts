
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBranches() {
    try {
        console.log('Updating course branches...');

        // 1. Structural Engineering
        const structCourse = await prisma.course.updateMany({
            where: {
                slug: "structural-engineering-theory-practice"
            },
            data: {
                branch: "Civil Engineering"
            }
        });
        console.log(`Updated Structural Engineering: ${structCourse.count} records`);

        // 2. Engineering Mathematics-II
        // Note: Using the slug found in the DB dump earlier
        const mathCourse = await prisma.course.updateMany({
            where: {
                slug: "advanced-structural-dynamics" // This was the slug for the math course in the DB
            },
            data: {
                branch: "Electronics & Communication"
            }
        });
        console.log(`Updated Engineering Mathematics-II: ${mathCourse.count} records`);

    } catch (error) {
        console.error('Error updating branches:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateBranches();
