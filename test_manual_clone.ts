import prisma from './src/utils/prisma.js';
import { AdminService } from './src/services/adminService.js';

async function testClone() {
    // 0. Find a valid admin
    const admin = await prisma.user.findFirst({
        where: { role: { in: ['admin', 'super_admin'] } }
    });
    
    if (!admin) {
        console.error('No admin found');
        return;
    }

    const adminId = admin.id; 
    const sourceModuleId = '7bd39b3d-9063-40d9-9898-6943ff90d5ea'; // Module-1:Calculus
    const targetCourseId = '9f92d3f5-650a-4a88-9e9b-1dd321ab9a1b'; // VTU-MATHKIT BMATM101
    
    console.log(`Attempting to clone Module ${sourceModuleId} to Course ${targetCourseId}...`);
    
    try {
        const result = await AdminService.cloneModule(adminId, sourceModuleId, targetCourseId);
        console.log('Clone Success:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Clone Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testClone();
