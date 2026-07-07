import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("Checking Cloudinary Config...");
console.log("Cloud Name:", process.env.CLOUD_NAME ? "Set" : "Missing");
console.log("API Key:", process.env.CLOUD_API_KEY ? "Set" : "Missing");
console.log("API Secret:", process.env.CLOUD_API_SECRET ? "Set" : "Missing");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

async function testConnection() {
    try {
        const result = await cloudinary.api.ping();
        console.log("✅ Cloudinary Connection Successful:", result);
    } catch (error) {
        console.error("❌ Cloudinary Connection Failed:", error.message);
    }
}

testConnection();
