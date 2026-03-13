import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const BACKUP_PATH = "C:\\Users\\invt\\.gemini\\antigravity\\brain\\c8a48d5d-c22c-49e6-b52a-e12c903c3d9a\\mathinova_backup_full_2026-03-10.json";

async function main() {
    console.log(`🚀 Starting Full Database Recovery from: ${BACKUP_PATH}`);

    if (!fs.existsSync(BACKUP_PATH)) {
        throw new Error('Backup file not found!');
    }

    const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8'));

    // Tables in dependency order
    const tableOrder = [
        'user',
        'course',
        'module',
        'lesson',
        'video',
        'quiz',
        'question',
        'mCQOption',
        'pYQ',
        'pYQOccurrence',
        'enrollment',
        'order',
        'blogPost',
        'blogCategory'
    ];

    for (const tableName of tableOrder) {
        if (!backup[tableName] || backup[tableName].length === 0) {
            console.log(`- Skipping ${tableName} (No data)`);
            continue;
        }

        console.log(`📦 Restoring ${tableName} (${backup[tableName].length} records)...`);

        const records = backup[tableName];

        // Process in batches to avoid transaction timeouts
        const batchSize = 20;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            
            await prisma.$transaction(async (tx) => {
                for (const record of batch) {
                    // Convert date strings back to Date objects if needed
                    const data = { ...record };
                    for (const key in data) {
                        if (typeof data[key] === 'string' && data[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                            data[key] = new Date(data[key]);
                        }
                    }

                    try {
                        const modelName = tableName === 'pYQ' ? 'pYQ' : tableName === 'pYQOccurrence' ? 'pYQOccurrence' : tableName === 'mCQOption' ? 'mCQOption' : tableName;
                        const prismaModel = (tx as any)[modelName];
                        
                        if (!prismaModel) {
                            console.warn(`⚠️ Prisma model for ${tableName} not found!`);
                            continue;
                        }

                        await prismaModel.upsert({
                            where: { id: data.id },
                            update: data,
                            create: data
                        });
                        console.log(`  - Upserted ${tableName} record: ${data.id}`);
                    } catch (err) {
                        console.error(`❌ Failed to upsert record in ${tableName} (${data.id}):`, (err as Error).message);
                    }
                }
            }, { timeout: 300000 }); // 5 minutes timeout
            console.log(`  ✅ Batch processed ${Math.min(i + batchSize, records.length)}/${records.length}`);
        }
    }

    console.log('✅ Recovery Complete!');
}

main()
    .catch(e => {
        console.error('❌ Recovery Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
