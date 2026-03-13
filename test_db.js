import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString);

async function test() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Successfully connected to PostgreSQL!');
        const res = await client.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0]);
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

test();
