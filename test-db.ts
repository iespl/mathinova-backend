import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const originalUrl = process.env.DATABASE_URL || '';
// Convert to direct URL: change port 6543 -> 5432, remove pgbouncer=true
const directUrl = originalUrl.replace('6543', '5432').replace('&pgbouncer=true', '').replace('?pgbouncer=true', '');

console.log('Original URL:', originalUrl.replace(/:[^:@]*@/, ':****@')); // Mask password
console.log('Testing Direct URL:', directUrl.replace(/:[^:@]*@/, ':****@'));

const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
});

console.log('Testing connection to:', process.env.DATABASE_URL?.split('@')[1]); // Log host only for privacy

async function testConnection() {
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0]);
        await client.end();
        console.log('Connection closed.');
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
