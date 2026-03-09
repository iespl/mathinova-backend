
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- TABLES IN PUBLIC SCHEMA ---');
    const tables: any[] = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
    console.log(JSON.stringify(tables, null, 2));

    console.log('--- COLUMNS IN Course/course ---');
    const columns: any[] = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_name ILIKE 'course'
  `);
    console.log(JSON.stringify(columns, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
