import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Create Enum
        console.log('Creating PricingType enum...');
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PricingType') THEN
                    CREATE TYPE "PricingType" AS ENUM ('paid', 'free');
                END IF;
            END
            $$;
        `);

        // 2. Add Column
        console.log('Adding pricingType column to Course table...');
        await client.query(`
            ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "pricingType" "PricingType" DEFAULT 'paid';
        `);

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
