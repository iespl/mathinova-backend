import 'dotenv/config';
import { AuthService } from './src/services/authService';
import fs from 'fs';

// Use one of the verified test users from Phase 1
const email = 'phase1_final_1772004284027@example.com';

const orig = console.log;
let link = '';
console.log = (...a: any[]) => {
    const m = a.join(' ');
    if (m.includes('Reset URL:')) link = m.split('Reset URL: ')[1].trim();
    orig(...a);
};

await AuthService.forgotPassword(email);
fs.writeFileSync('reset_link.txt', link);
orig('RESET LINK:', link);
