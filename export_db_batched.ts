import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Increase statement timeout to 5 minutes for large tables
async function setStatementTimeout() {
    await prisma.$executeRawUnsafe(`SET statement_timeout = '300000'`);
}

async function fetchInBatches(prismaModel: any, modelName: string, batchSize = 500): Promise<any[]> {
    const results: any[] = [];
    let skip = 0;
    while (true) {
        const batch = await prismaModel.findMany({ skip, take: batchSize });
        if (batch.length === 0) break;
        results.push(...batch);
        console.log(`  📦 ${modelName}: fetched ${results.length} records so far...`);
        skip += batchSize;
        if (batch.length < batchSize) break;
    }
    return results;
}

async function main() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `mathinova_backup_batched_${timestamp}.json`;
    const outputPath = path.join(process.cwd(), filename);

    console.log(`🚀 Starting Batched Database Export to: ${filename}`);

    try {
        await setStatementTimeout();
        console.log('✅ Statement timeout set to 5 minutes');
    } catch (e) {
        console.warn('⚠️ Could not set statement timeout (may be restricted by pooler), continuing...');
    }

    const models: Array<{ name: string; key: string; useBatch?: boolean }> = [
        { name: 'user', key: 'user' },
        { name: 'verificationToken', key: 'verificationToken' },
        { name: 'passwordReset', key: 'passwordReset' },
        { name: 'course', key: 'course' },
        { name: 'module', key: 'module' },
        { name: 'lesson', key: 'lesson' },
        { name: 'video', key: 'video', useBatch: true },
        { name: 'resource', key: 'resource' },
        { name: 'coupon', key: 'coupon' },
        { name: 'order', key: 'order' },
        { name: 'payment', key: 'payment' },
        { name: 'enrollment', key: 'enrollment' },
        { name: 'progress', key: 'progress' },
        { name: 'quiz', key: 'quiz' },
        { name: 'question', key: 'question' },
        { name: 'mCQOption', key: 'mCQOption' },
        { name: 'quizAttempt', key: 'quizAttempt' },
        { name: 'questionAttempt', key: 'questionAttempt' },
        { name: 'pYQ', key: 'pYQ', useBatch: true },
        { name: 'pYQOccurrence', key: 'pYQOccurrence', useBatch: true },
        { name: 'pYQView', key: 'pYQView', useBatch: true },
        { name: 'auditLog', key: 'auditLog', useBatch: true },
        { name: 'contentIngestionLog', key: 'contentIngestionLog' },
        { name: 'branch', key: 'branch' },
    ];

    const data: any = {};

    for (const { name, key, useBatch } of models) {
        try {
            console.log(`📦 Exporting ${name}...`);
            const prismaModel = (prisma as any)[key];
            if (!prismaModel) {
                console.warn(`⚠️ Model ${name} not found in Prisma client.`);
                continue;
            }
            const records = useBatch
                ? await fetchInBatches(prismaModel, name)
                : await prismaModel.findMany();
            data[key] = records;
            console.log(`  ✅ ${records.length} records exported.`);
        } catch (err) {
            console.error(`❌ Failed to export ${name}:`, (err as Error).message);
            data[key] = [];
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n✨ Export Complete! File saved to: ${outputPath}`);

    // Print summary
    console.log('\n📊 Export Summary:');
    for (const [model, records] of Object.entries(data)) {
        console.log(`  ${model}: ${(records as any[]).length} records`);
    }
}

main()
    .catch(e => {
        console.error('❌ Export Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
