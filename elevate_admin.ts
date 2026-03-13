import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function elevateAdmin() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' }
      });
      console.log(`User ${user.email} elevated to admin.`);
    } else {
      console.log('No users found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

elevateAdmin();
