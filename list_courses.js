import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function listAll() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, slug, title FROM "Course"');
        console.log('Courses in DB:');
        res.rows.forEach(r => console.log(`- "${r.id}" | "${r.slug}" | "${r.title}"`));
    } catch (err) {
        console.error('List failed:', err);
    } finally {
        await client.end();
    }
}

listAll();
