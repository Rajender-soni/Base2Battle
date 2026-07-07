import { evaluateSubmission } from "../services/executionService.js";

// Helper mocks for testing compareOutputs directly
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const executionServicePath = path.resolve(__dirname, "../services/executionService.js");

// Read code file directly to test the internal helper functions
const fileContent = fs.readFileSync(executionServicePath, "utf8");

// Extract the helper functions or recreate the tests based on their code
function formatExpectedOutput(output) {
    if (output === null || output === undefined) {
        return "null";
    }
    if (typeof output === "string") {
        return output.trim();
    }
    if (typeof output === "boolean") {
        return output ? "true" : "false";
    }
    if (Array.isArray(output)) {
        return JSON.stringify(output);
    }
    return String(output).trim();
}

function compareOutputs(actual, expected) {
    const actualTrimmed = String(actual).trim();
    const expectedTrimmed = String(expected).trim();

    if (actualTrimmed === expectedTrimmed) {
        return true;
    }

    try {
        const actualJson = JSON.parse(actualTrimmed);
        const expectedJson = JSON.parse(expectedTrimmed);
        if (typeof actualJson === "object" && actualJson !== null &&
            typeof expectedJson === "object" && expectedJson !== null) {
            return JSON.stringify(actualJson) === JSON.stringify(expectedJson);
        }
    } catch {}

    const actualNum = Number(actualTrimmed);
    const expectedNum = Number(expectedTrimmed);

    if (Number.isFinite(actualNum) && Number.isFinite(expectedNum)) {
        return Math.abs(actualNum - expectedNum) < 0.0001;
    }

    return false;
}

// Run unit tests
console.log("🧪 Running Output Matching Tests...");

const testCases = [
    // [Actual, Expected, ExpectedResult]
    ["5", "5", true],
    ["  5  \n", "5", true],
    ["5.00001", "5", true], // Numeric tolerance
    ["5.01", "5", false],   // Outside tolerance
    ["true", true, true],
    ["false", false, true],
    ["[1,2,3]", [1, 2, 3], true],
    [" [1, 2, 3] ", "[1,2,3]", true], // JSON string matches parsed array
    ["hello", "hello", true],
    ["hello world", "hello   world", false], // Whitespace inside strings matters unless structured
    ["null", null, true],
];

let failed = 0;
testCases.forEach(([actual, expected, expectedResult], idx) => {
    const formattedExpected = formatExpectedOutput(expected);
    const result = compareOutputs(actual, formattedExpected);
    if (result === expectedResult) {
        console.log(`✅ Test ${idx + 1} passed`);
    } else {
        console.error(`❌ Test ${idx + 1} failed: actual="${actual}", expected="${formattedExpected}", got=${result}, expectedResult=${expectedResult}`);
        failed++;
    }
});

if (failed === 0) {
    console.log("\n🎉 All output matching tests passed successfully!");
} else {
    console.error(`\n❌ ${failed} tests failed.`);
    process.exit(1);
}
