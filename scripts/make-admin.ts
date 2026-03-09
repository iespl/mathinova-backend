
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'rajan@innoventengg.com';
    const password = 'Rajan@123';
    const name = 'Rajan'; // Default name if creating new

    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Checking for user: ${email}...`);

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log(`User found (ID: ${existingUser.id}). Updating role to 'admin' and resetting password...`);
        await prisma.user.update({
            where: { email },
            data: {
                role: 'admin',
                passwordHash, // Reset password to ensure they can login
                isActive: true // Ensure they are active
            },
        });
        console.log('User updated successfully.');
    } else {
        console.log(`User not found. Creating new admin user...`);
        await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role: 'admin',
                isActive: true
            },
        });
        console.log('User created successfully.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
