import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seed start...');

    const slug = 'advanced-structural-dynamics';

    await prisma.course.deleteMany({ where: { slug } });
    console.log('🗑️ Cleaned up.');

    const course = await prisma.course.create({
        data: {
            title: 'Advanced Structural Dynamics',
            slug: slug,
            description: 'Structural behavior under dynamic loads.',
            basePrice: 1499.00,
            currency: 'INR',
            status: 'published',
            modules: {
                create: [
                    {
                        title: 'Module 1',
                        order: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Lesson 1',
                                    order: 1,
                                    videos: {
                                        create: [
                                            {
                                                videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                                                duration: 600
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log(`✅ Created: ${course.id}`);
}

main()
    .catch((e) => {
        console.error('❌ FAILED:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
