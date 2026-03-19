import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const BACKUP_PATH = "f:\\mathinova_backup_full_2026-03-12T09-28-29.json";

async function main() {
    console.log(`🚀 Starting Full Database Restoration from: ${BACKUP_PATH}`);

    if (!fs.existsSync(BACKUP_PATH)) {
        throw new Error(`Backup file not found at: ${BACKUP_PATH}`);
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
        'blogCategory',
        'blogPost'
    ];

    for (const tableName of tableOrder) {
        if (!backup[tableName] || backup[tableName].length === 0) {
            console.log(`- Skipping ${tableName} (No data)`);
            continue;
        }

        console.log(`📦 Restoring ${tableName} (${backup[tableName].length} records)...`);

        const records = backup[tableName];
        // Process in ultra-safe batches to avoid transaction timeouts P2028
        const batchSize = 5;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            
            await prisma.$transaction(async (tx) => {
                for (const record of batch) {
                    const data = { ...record };
                    
                    // Convert date strings back to Date objects
                    for (const key in data) {
                        if (typeof data[key] === 'string' && data[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                            data[key] = new Date(data[key]);
                        }
                    }

                    try {
                        const modelName = tableName;
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
                    } catch (err) {
                        console.error(`❌ Failed to upsert record in ${tableName} (${data.id}):`, (err as Error).message);
                    }
                }
            }, { timeout: 180000 }); // 180s timeout per ultra-safe batch
            
            console.log(`  ✅ Batch processed ${Math.min(i + batchSize, records.length)}/${records.length}`);
            // Small delay to let DB breathe
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log('✅ Restoration Complete!');
}

main()
    .catch(e => {
        console.error('❌ Restoration Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
