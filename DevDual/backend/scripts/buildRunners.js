import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

const runners = [
  { name: "cpp-runner", dir: "./docker/cpp" },
  { name: "js-runner", dir: "./docker/js" },
  { name: "python-runner", dir: "./docker/python" },
];

console.log("🐳 Building Docker runner images...");

for (const runner of runners) {
  try {
    console.log(`\nBuilding image: ${runner.name} from ${runner.dir}...`);
    const fullPath = path.resolve(backendDir, runner.dir);
    execSync(`docker build -t ${runner.name} "${fullPath}"`, {
      stdio: "inherit",
      cwd: backendDir,
    });
    console.log(`✅ Successfully built ${runner.name}`);
  } catch (error) {
    console.error(`❌ Failed to build image ${runner.name}:`, error.message);
  }
}

console.log("\n🎉 Docker runner image build process finished.");
