import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function findStudent() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, email, name, role FROM "User" WHERE role = \'student\' LIMIT 1');
        if (res.rows.length > 0) {
            console.log('Test Student:');
            res.rows.forEach(r => console.log(`- ID: ${r.id}, Email: ${r.email}, Name: ${r.name}`));
        } else {
            console.log('No student found. Checking all users:');
            const all = await client.query('SELECT id, email, role FROM "User" LIMIT 5');
            all.rows.forEach(r => console.log(`- ID: ${r.id}, Email: ${r.email}, Role: ${r.role}`));
        }
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await client.end();
    }
}

findStudent();
