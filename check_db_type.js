import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    const client = new pg.Pool({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        const res = await client.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'Course' AND column_name = 'learningPoints'
        `);
        console.log('Column info:', res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
