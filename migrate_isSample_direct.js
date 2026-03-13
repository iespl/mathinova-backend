import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function addCol() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('Connected to database');

        console.log('Adding isSample column to Video table...');
        await client.query(`
            ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;
        `);

        console.log('Column added successfully!');
    } catch (err) {
        console.error('Failed to add column:', err);
    } finally {
        await client.end();
    }
}
addCol();
