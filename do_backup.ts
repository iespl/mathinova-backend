import { execSync } from 'child_process';
import fs from 'fs';

const pgDumpPath = '"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe"';
const dbUrl = 'postgresql://postgres.cqxhjbudlwnuwnqkando:1InnoVent23@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?schema=public';
const outputFile = 'c:\\Users\\invt\\.gemini\\antigravity\\scratch\\mathinova_backup.sql';

try {
    console.log('Starting backup...');
    const command = `${pgDumpPath} --dbname="${dbUrl}" -f ${outputFile} --no-owner --no-privileges`;
    console.log('Command:', command);
    execSync(command, { stdio: 'inherit' });
    console.log('Backup successful!');
} catch (error) {
    console.error('Backup failed!');
    if (error.stderr) console.error('Stderr:', error.stderr.toString());
    if (error.stdout) console.log('Stdout:', error.stdout.toString());
    process.exit(1);
}
