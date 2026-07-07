import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

async function testUpload() {
    console.log("Attempting to upload test image...");
    try {
        // 1x1 transparent pixel
        const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        const result = await cloudinary.uploader.upload(base64Image, {
            folder: "test_uploads"
        });

        console.log("✅ Upload Successful!");
        console.log("URL:", result.secure_url);
    } catch (error) {
        console.error("❌ Upload Failed:", error.message);
        if (error.http_code) console.error("HTTP Code:", error.http_code);
    }
}

testUpload();
