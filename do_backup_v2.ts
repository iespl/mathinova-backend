import { spawn } from 'child_process';
import fs from 'fs';

const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
const dbUrl = 'postgresql://postgres.cqxhjbudlwnuwnqkando:1InnoVent23@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?schema=public';
const outputFile = 'backup_v2.sql';

console.log('Starting backup v2...');
const child = spawn(pgDumpPath, [
    '--dbname=' + dbUrl,
    '-f', outputFile,
    '--no-owner',
    '--no-privileges'
]);

child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
        console.log('Backup COMPLETED successfully!');
    } else {
        console.error('Backup FAILED!');
    }
    process.exit(code);
});
