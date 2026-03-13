
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up rogue course record...");
    const rogueId = "533694f6-1f9f-4d24-b265-daaf1399910c";

    try {
        const deleted = await prisma.course.delete({
            where: { id: rogueId }
        });
        console.log("✅ Deleted rogue course:", deleted.id, deleted.title);
    } catch (e) {
        console.log("ℹ️ Rogue course not found or already deleted:", e.code);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
