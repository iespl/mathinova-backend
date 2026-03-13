import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function findDuplicates() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const res = await client.query('SELECT slug, COUNT(*) FROM "Course" GROUP BY slug HAVING COUNT(*) > 1');
        if (res.rows.length > 0) {
            console.log('Duplicate slugs found:');
            res.rows.forEach(r => console.log(`- Slug: "${r.slug}", Count: ${r.count}`));
        } else {
            console.log('No duplicate slugs found in the table itself.');
        }

        const all = await client.query('SELECT id, slug FROM "Course"');
        console.log('All IDs and Slugs:');
        all.rows.forEach(r => console.log(`- ID: "${r.id}", Slug: "${r.slug}"`));
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await client.end();
    }
}

findDuplicates();
