
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Fixing Course Records...");

    // 1. Fix the mismatched course
    // ID: 533694f6-1f9f-4d24-b265-daaf1399910c
    // Current: Title="Advanced...", Slug="structural..."
    // Desired: Title="Structural...", Slug="structural..."
    try {
        const fixed = await prisma.course.update({
            where: { id: "533694f6-1f9f-4d24-b265-daaf1399910c" },
            data: {
                title: "Structural Engineering: Theory to Practice",
                slug: "structural-engineering-theory-practice"
            }
        });
        console.log("✅ Fixed existing course:", fixed.title, fixed.slug);
    } catch (e) {
        console.error("❌ Failed to fix existing course:", e);
    }

    // 2. Create the new course if not exists
    const newCourseId = "course-adv-struct-dyn-v1";
    try {
        const exists = await prisma.course.findUnique({ where: { id: newCourseId } });
        if (!exists) {
            const created = await prisma.course.create({
                data: {
                    id: newCourseId,
                    title: "Advanced Structural Dynamics",
                    slug: "advanced-structural-dynamics",
                    description: "Comprehensive course on structural behavior under dynamic loads.",
                    thumbnail: "https://mathinova23.b-cdn.net/new%20thumbnails/BMATE301-NEW.webp",
                    basePrice: 4999,
                    currency: "INR",
                    status: "published",
                    category: "Engineering",
                    level: "Professional"
                }
            });
            console.log("✅ Created new course:", created.title, created.slug);
        } else {
            console.log("ℹ️ New course already exists.");
        }
    } catch (e) {
        console.error("❌ Failed to create new course:", e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
