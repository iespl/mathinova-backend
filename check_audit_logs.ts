import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  console.log('--- Last 20 Audit Logs ---');
  logs.forEach(log => {
    console.log(`Time: ${log.createdAt.toISOString()}`);
    console.log(`Action: ${log.action}`);
    console.log(`Entity: ${log.entityType} (${log.entityId})`);
    console.log('---');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
