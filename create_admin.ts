
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const name = 'Mathinova Assistant';
    const email = 'assistant@mathinova.com';
    const password = 'MathinovaAdmin2024';

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name,
            passwordHash,
            role: 'admin',
            emailVerified: true
        },
        create: {
            name,
            email,
            passwordHash,
            role: 'admin',
            emailVerified: true
        }
    });

    console.log(`\nSUCCESS: Admin user created/updated.`);
    console.log(`  Name  : ${user.name}`);
    console.log(`  Email : ${user.email}`);
    console.log(`  Role  : ${user.role}`);
    console.log(`  Status: Verified\n`);
}

main()
    .catch(e => console.error('Error creating admin:', e))
    .finally(async () => await prisma.$disconnect());
