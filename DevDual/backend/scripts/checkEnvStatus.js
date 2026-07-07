import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const status = {
    cloudName: process.env.CLOUD_NAME,
    apiKeyPresent: !!process.env.CLOUD_API_KEY,
    apiSecretPresent: !!process.env.CLOUD_API_SECRET,
    timestamp: new Date().toISOString()
};

fs.writeFileSync(path.join(__dirname, "../env_status.txt"), JSON.stringify(status, null, 2));
console.log("Status written to env_status.txt");
