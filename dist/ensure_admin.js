import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    const email = 'admin@mathinova.com';
    const password = 'Password@123';
    const name = 'Admin User';
    const role = 'admin';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: { role, passwordHash },
        create: {
            name,
            email,
            passwordHash,
            role
        }
    });
    console.log(`Admin user ensured: ${user.email} (password: ${password})`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=ensure_admin.js.map