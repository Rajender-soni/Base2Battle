import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "../.env");

console.log("Checking .env at:", envPath);

if (fs.existsSync(envPath)) {
    console.log(".env file found.");
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach(line => {
        const [key] = line.split('=');
        if (key && key.trim()) {
            console.log("Found key:", key.trim());
        }
    });
} else {
    console.log(".env file NOT found.");
}
