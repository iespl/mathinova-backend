import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    const slug = 'advanced-structural-dynamics';
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            videos: true
                        }
                    }
                }
            }
        }
    });
    fs.writeFileSync('all_videos_fixed.json', JSON.stringify(course, null, 2));
    console.log("Written to all_videos_fixed.json");
}
main().finally(() => prisma.$disconnect());
