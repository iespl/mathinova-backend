import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function checkPricing() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, slug, title, "pricingType" FROM "Course" WHERE slug = $1', ['advanced-structural-dynamics']);
        console.log('Course Details:');
        res.rows.forEach(r => console.log(`- ID: ${r.id}, Slug: ${r.slug}, Title: ${r.title}, Pricing: ${r.pricingType}`));
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await client.end();
    }
}

checkPricing();
