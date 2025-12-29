
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');
const notFoundHtml = path.join(distDir, '404.html');

console.log('Post-build: Copying index.html to 404.html for GitHub Pages...');

if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, notFoundHtml);
    console.log('✅ Successfully created 404.html');
} else {
    console.error('❌ Error: dist/index.html not found!');
    process.exit(1);
}
