import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixEncoding(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        // Try to detect UTF-16LE
        let content;
        if (buffer[0] === 0xff && buffer[1] === 0xfe) {
            content = buffer.toString('utf16le');
        } else if (buffer[0] === 0xfe && buffer[1] === 0xff) {
            content = buffer.toString('utf16be');
        } else {
            // Assume it's already UTF-8 or similar and just re-write to be sure
            content = buffer.toString('utf-8');
            // Remove BOM if present
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed: ${filePath}`);
    } catch (err) {
        console.error(`❌ Failed: ${filePath}`, err);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            fixEncoding(fullPath);
        }
    });
}

const srcDir = path.join(__dirname, 'src');
walk(srcDir);
console.log('Encoding fix complete!');
