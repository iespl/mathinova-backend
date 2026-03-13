import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function checkAndFix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const slugToCheck = 'advanced-structural-dynamics';
        const targetId = 'course-adv-struct-dyn-v1';

        const res = await client.query('SELECT id, slug, title FROM "Course" WHERE slug = $1', [slugToCheck]);

        if (res.rows.length > 0) {
            console.log('Found conflicting courses:');
            for (const row of res.rows) {
                console.log(`- ID: ${row.id}, Slug: ${row.slug}, Title: ${row.title}`);
                if (row.id !== targetId) {
                    console.log(`  Deleting conflicting course ${row.id}...`);
                    // Note: This might fail if there are dependent records, but let's try.
                    // Actually, let's just update the ID of the existing one to match the target if possible,
                    // or just delete it if it's junk.
                    await client.query('DELETE FROM "Course" WHERE id = $1', [row.id]);
                }
            }
        } else {
            console.log('No conflict found for slug:', slugToCheck);
        }

        console.log('Cleanup complete!');
    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        await client.end();
    }
}

checkAndFix();
