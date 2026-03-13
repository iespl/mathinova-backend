
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Production Ingestion...');
    const log = await prisma.contentIngestionLog.findFirst({
        orderBy: { executedAt: 'desc' }
    });

    if (log) {
        console.log('✅ Found Log Entry:');
        console.log(`- Version: ${log.manifestVersion}`);
        console.log(`- Status: ${log.status}`);
        console.log(`- Time: ${log.executedAt}`);
        // console.log('- Details:', JSON.stringify(log.details, null, 2));
    } else {
        console.log('❌ No Ingestion Log Found!');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
