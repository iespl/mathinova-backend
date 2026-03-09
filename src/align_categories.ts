import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

async function main() {
    console.log('🚀 Script started. Connecting to DB...');
    try {
        await prisma.$connect();
        console.log('✅ Connected to Database.');

        console.log('Fetching all courses...');
        const courses = await prisma.course.findMany();
        const categories = ['Semester - I', 'Semester - II', 'Semester - III'];

        console.log(`Found ${courses.length} courses to update.`);

        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const newCategory = categories[i % categories.length];

            console.log(`Updating course: ${course.title} (${course.id}) -> ${newCategory}`);
            await prisma.course.update({
                where: { id: course.id },
                data: { category: newCategory }
            });
            console.log(`✅ Updated.`);
        }

        console.log('--- Alignment Complete ---');
    } catch (error) {
        console.error('❌ Script Error:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Main Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
