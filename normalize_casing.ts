import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting UUID Casing Normalization ---');

    const tables = [
        { name: 'course', fields: ['id'] },
        { name: 'module', fields: ['id', 'courseId'] },
        { name: 'lesson', fields: ['id', 'moduleId'] },
        { name: 'video', fields: ['id', 'lessonId'] },
        { name: 'pYQ', fields: ['id', 'lessonId'] },
        { name: 'pYQOccurrence', fields: ['id', 'pyqId'] },
        { name: 'quiz', fields: ['id', 'lessonId'] },
        { name: 'question', fields: ['id', 'quizId'] },
        { name: 'mCQOption', fields: ['id', 'questionId'] },
        { name: 'enrollment', fields: ['id', 'userId', 'courseId'] },
        { name: 'order', fields: ['id', 'userId', 'courseId'] },
        { name: 'payment', fields: ['id', 'orderId'] },
        { name: 'auditLog', fields: ['id', 'actorUserId', 'entityId'] }
    ];

    for (const table of tables) {
        console.log(`Processing table: ${table.name}...`);
        const model = (prisma as any)[table.name];
        if (!model) {
            console.warn(`  - Model ${table.name} not found in Prisma!`);
            continue;
        }

        const records = await model.findMany();
        let updatedCount = 0;

        for (const record of records) {
            const updateData: any = {};
            let needsUpdate = false;

            for (const field of table.fields) {
                const val = record[field];
                if (typeof val === 'string' && val !== val.toLowerCase()) {
                    updateData[field] = val.toLowerCase();
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                try {
                    await model.update({
                        where: { id: record.id },
                        data: updateData
                    });
                    updatedCount++;
                } catch (err) {
                    console.error(`  - Failed to update ${table.name} record ${record.id}:`, (err as Error).message);
                }
            }
        }
        console.log(`  - Updated ${updatedCount}/${records.length} records.`);
    }

    console.log('--- Normalization Complete ---');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
