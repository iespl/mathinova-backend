import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Attempting to add columns via raw SQL...");

        // Add enrollmentSource to Enrollment if missing
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Enrollment" 
            ADD COLUMN IF NOT EXISTS "enrollmentSource" TEXT DEFAULT 'paid';
        `);
        console.log("✅ Enrollment table updated.");

        // Add promoVideoUrl to Course if missing
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Course" 
            ADD COLUMN IF NOT EXISTS "promoVideoUrl" TEXT;
        `);
        console.log("✅ Course table updated.");

        // Verify Course columns
        const courseColumns = await prisma.$queryRawUnsafe(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Course';
        `);
        console.log("Current columns in Course:");
        console.log(JSON.stringify(courseColumns, null, 2));

    } catch (err: any) {
        console.error("❌ Failed to fix schema:");
        console.error(err.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
