import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `mathinova_backup_full_${timestamp}.json`;
    const outputPath = path.join(process.cwd(), filename);

    console.log(`🚀 Starting Full Database Export to: ${filename}`);

    // List of models to export based on schema.prisma
    const models = [
        'user',
        'verificationToken',
        'passwordReset',
        'course',
        'module',
        'lesson',
        'video',
        'resource',
        'coupon',
        'order',
        'payment',
        'enrollment',
        'progress',
        'quiz',
        'question',
        'mCQOption',
        'quizAttempt',
        'questionAttempt',
        'pYQ',
        'pYQOccurrence',
        'pYQView',
        'auditLog',
        'contentIngestionLog',
        'branch'
    ];

    const data: any = {};

    for (const modelName of models) {
        try {
            console.log(`📦 Exporting ${modelName}...`);
            const prismaModel = (prisma as any)[modelName];
            if (!prismaModel) {
                console.warn(`⚠️ Model ${modelName} not found in Prisma client.`);
                continue;
            }
            const records = await prismaModel.findMany();
            data[modelName] = records;
            console.log(`  ✅ ${records.length} records exported.`);
        } catch (err) {
            console.error(`❌ Failed to export ${modelName}:`, (err as Error).message);
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n✨ Export Complete! File saved to: ${outputPath}`);
}

main()
    .catch(e => {
        console.error('❌ Export Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
