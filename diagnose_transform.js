import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testTransform(filePath) {
    console.log(`Testing: ${filePath}`);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        await esbuild.transform(content, { loader: 'ts' });
        console.log(`✅ OK: ${filePath}`);
    } catch (err) {
        console.log(`❌ FAIL: ${filePath}`);
        console.error(err);
    }
}

async function run() {
    const srcDir = path.join(__dirname, 'src');
    const files = [];

    function walk(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (fullPath.endsWith('.ts')) {
                files.push(fullPath);
            }
        });
    }

    walk(srcDir);

    for (const file of files) {
        await testTransform(file);
    }
}

run();
