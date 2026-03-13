
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const raw = fs.readFileSync(path.join(__dirname, 'content_manifest.json'), 'utf-8');
    JSON.parse(raw);
    console.log('✅ JSON is valid.');
} catch (e) {
    console.error('❌ JSON Error:', e.message);
}
