import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courseCount = await prisma.course.count();
  const moduleCount = await prisma.module.count();
  const lessonCount = await prisma.lesson.count();
  const videoCount = await prisma.video.count();
  const pyqCount = await prisma.pYQ.count();

  console.log('Database Audit:');
  console.log('Courses:', courseCount);
  console.log('Modules:', moduleCount);
  console.log('Lessons:', lessonCount);
  console.log('Videos:', videoCount);
  console.log('PYQs:', pyqCount);

  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { modules: true }
      }
    }
  });

  for (const c of courses) {
    const modules = await prisma.module.findMany({
      where: { courseId: c.id },
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });
    console.log(`\nCourse: ${c.title} (Slug: ${c.slug}, Status: ${c.status})`);
    console.log(`  Modules: ${c._count.modules}`);
    for (const m of modules) {
      console.log(`    Module: ${m.title} - Lessons: ${m._count.lessons}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
