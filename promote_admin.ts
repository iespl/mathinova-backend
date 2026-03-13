import prisma from './src/utils/prisma.js';
async function main() {
    await prisma.user.update({
        where: { email: 'admin@mathinova.com' },
        data: { role: 'admin' }
    });
    console.log('Promoted admin@mathinova.com to admin');
}
main().catch(console.error).finally(() => prisma.$disconnect());
