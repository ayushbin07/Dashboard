import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const count = execSync('git rev-list --count HEAD').toString().trim();
    const versionContent = `export const APP_VERSION = 'v1.${count}'\n`;
    const versionPath = path.join(__dirname, '../src/version.ts');

    fs.writeFileSync(versionPath, versionContent);
    console.log(`Updated version to v1.${count}`);
} catch (error) {
    console.error('Failed to update version:', error);
    // Determine existing content or fallback
    // If fail (no git), stick to existing or default.
}
