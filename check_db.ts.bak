import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { modules: true }
      }
    }
  });
  console.log('Courses count:', courses.length);
  for (const c of courses) {
    const modules = await prisma.module.findMany({ where: { courseId: c.id } });
    console.log(`Course: ${c.title}, Modules: ${modules.length}, Status: ${c.status}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
