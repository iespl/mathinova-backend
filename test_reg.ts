import 'dotenv/config';
import { AuthService } from './src/services/authService';
import fs from 'fs';

const email = `phase1_final_${Date.now()}@example.com`;
const pass = 'Password123!';

const orig = console.log;
let link = '';
console.log = (...a: any[]) => {
    const m = a.join(' ');
    if (m.includes('Verification URL:')) link = m.split('Verification URL: ')[1].trim();
    orig(...a);
};

await AuthService.register('Phase1 Final', email, pass, 'student' as any);
fs.writeFileSync('e2e_creds.json', JSON.stringify({ email, link }));
orig('EMAIL:', email);
orig('LINK:', link);
