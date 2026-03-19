import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function backup() {
    const backupData: any = {};
    const models = [
        'user', 'verificationToken', 'passwordReset', 'course', 'module', 
        'lesson', 'video', 'resource', 'coupon', 'order', 'payment', 
        'enrollment', 'progress', 'quiz', 'question', 'mCQOption', 
        'quizAttempt', 'questionAttempt', 'pYQ', 'pYQOccurrence', 
        'pYQView', 'auditLog', 'contentIngestionLog', 'branch'
    ];

    console.log('Starting Prisma-based data backup...');

    for (const model of models) {
        try {
            console.log(`Backing up ${model}...`);
            const data = await (prisma as any)[model].findMany();
            backupData[model] = data;
        } catch (error) {
            console.error(`Failed to backup ${model}:`, error);
        }
    }

    const outputFile = 'c:\\Users\\invt\\.gemini\\antigravity\\scratch\\mathinova_data_backup.json';
    fs.writeFileSync(outputFile, JSON.stringify(backupData, null, 2));
    console.log(`Backup saved to ${outputFile}`);
    process.exit(0);
}

backup();
