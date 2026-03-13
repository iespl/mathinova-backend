import prisma from './src/utils/prisma.js';
import { AdminService } from './src/services/adminService.js';

async function main() {
    const moduleId = 'mod-core-concepts';
    const title = 'SIMULATED LESSON';
    const order = 10;
    try {
        console.log(`Attempting to add lesson to module: ${moduleId}`);
        const result = await AdminService.addLesson(moduleId, title, order);
        console.log('Success:', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.code) console.error('Prisma Code:', error.code);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
