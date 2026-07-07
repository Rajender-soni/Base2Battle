import Docker from "dockerode";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const docker = new Docker();

function cleanDockerLogs(buffer) {
    let result = "";
    let offset = 0;

    while (offset < buffer.length) {
        const length =
            buffer.readUInt32BE(
                offset + 4
            );

        result += buffer
            .slice(
                offset + 8,
                offset + 8 + length
            )
            .toString();

        offset += 8 + length;
    }

    return result.trim();
}

const LANGUAGE_CONFIG = {
    cpp: {
        image: "cpp-runner",
        filename: "main.cpp",
        command:
            "g++ main.cpp -std=c++20 -O2 -o main && ./main < input.txt"
    }
};

export async function runDocker(
    code,
    input,
    language = "cpp",
    expectedOutput = null,
    targetFuncName = null
) {
    // Dynamically generate LeetCode-style wrappers if raw snippets are detected
    let finalCode = code;
    // If input is already an object/array (from MongoDB), serialize it properly.
    // String() would give "[object Object]" which breaks the C++ wrapper.
    const inputStr = (input === null || input === undefined)
        ? ""
        : (typeof input === "object" ? JSON.stringify(input) : String(input)).trim();
    
    if (language === "cpp" && code.includes("class Solution")) {
        finalCode = `#include <iostream>\n#include <vector>\n#include <string>\n#include <map>\n#include <unordered_map>\n#include <set>\n#include <unordered_set>\n#include <stack>\n#include <queue>\n#include <deque>\n#include <algorithm>\n#include <numeric>\n#include <climits>\n#include <cmath>\n#include <sstream>\nusing namespace std;\n\n${code}\n\n`;
        let regex = /class\s+Solution\s*\{[\s\S]*?(?:public:\s*)?(?:static\s+)?([a-zA-Z0-9_<>\s*&]+)\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/;
        if (targetFuncName) {
            regex = new RegExp(`class\\s+Solution\\s*\\{[\\s\\S]*?(?:public:\\s*)?(?:static\\s+)?([a-zA-Z0-9_<>\\s*&]+)\\s+(${targetFuncName})\\s*\\((.*?)\\)`);
        }
        const match = code.match(regex);
        if (match) {
            const funcName = match[2].trim();
            const argsStr = match[3].trim();

            // Parse the input: could be a JSON object {key: val, ...} or a plain value
            let inputValues = [];
            try {
                const parsed = JSON.parse(inputStr);
                if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    // Named args object: extract values in order
                    inputValues = Object.values(parsed);
                } else {
                    // Single value (array, number, string etc)
                    inputValues = [parsed];
                }
            } catch {
                // Not valid JSON - use raw string
                inputValues = [inputStr];
            }

            // Parse parameter list from function signature
            const params = argsStr ? argsStr.split(',').map(p => p.trim()).filter(Boolean) : [];

            // Convert a JS value to a C++ literal for a given type
            const toCppLiteral = (type, value) => {
                const t = type.replace(/\s*&\s*$/, '').trim(); // strip trailing &
                if (t === 'string' || t === 'std::string') {
                    return `"${String(value).replace(/"/g, '\\"')}"`;
                } else if (t.includes('vector')) {
                    // Convert array to {}-initializer
                    if (Array.isArray(value)) {
                        const inner = value.map(v => toCppLiteral('auto', v)).join(', ');
                        return `{${inner}}`;
                    }
                    return String(value).replace(/\[/g, '{').replace(/\]/g, '}');
                } else if (t === 'bool') {
                    return value ? 'true' : 'false';
                } else if (t === 'char') {
                    return `'${String(value).replace(/'/g, "\\'")}'`;
                } else {
                    // int, long, double, auto, etc
                    if (Array.isArray(value)) {
                        const inner = value.map(v => toCppLiteral('auto', v)).join(', ');
                        return `{${inner}}`;
                    }
                    return String(value);
                }
            };

            // Build variable declarations and call args
            const declarations = [];
            const callArgs = [];

            for (let i = 0; i < params.length; i++) {
                const param = params[i];
                // Extract type: everything except the last identifier token
                const typeMatch = param.match(/^(.*?)(\w+)\s*$/);
                const rawType = typeMatch ? typeMatch[1].replace(/&$/, '').trim() : 'auto';
                const paramType = rawType || 'auto';
                const varName = `arg${i}`;
                const val = inputValues[i] !== undefined ? inputValues[i] : 0;
                const literal = toCppLiteral(paramType, val);
                declarations.push(`    ${paramType} ${varName} = ${literal};`);
                callArgs.push(varName);
            }

            finalCode += `\nint main() {\n    Solution sol;\n${declarations.join('\n')}\n    cout << sol.${funcName}(${callArgs.join(', ')}) << endl;\n    return 0;\n}\n`;
        }
    }

    const config =
        LANGUAGE_CONFIG[language];

    if (!config) {
        throw new Error(
            `Unsupported language: ${language}`
        );
    }

    const jobId =
        randomUUID();

    const tempDir =
        path.resolve(
            process.cwd(),
            "temp",
            jobId
        );

    let container;
    let timedOut = false;

    try {
        await fs.mkdir(
            tempDir,
            {
                recursive: true
            }
        );

        await fs.writeFile(
            path.join(
                tempDir,
                config.filename
            ),
            finalCode
        );

        await fs.writeFile(
            path.join(
                tempDir,
                "input.txt"
            ),
            String(input ?? "")
        );

        const bindPath =
            tempDir.replace(
                /\\/g,
                "/"
            );

        container =
            await docker.createContainer({
                Image:
                    config.image,

                Cmd: [
                    "sh",
                    "-c",
                    config.command
                ],

                WorkingDir:
                    "/app",

                HostConfig: {
                    Binds: [
                        `${bindPath}:/app`
                    ],

                    Memory:
                        512 *
                        1024 *
                        1024,

                    MemorySwap:
                        512 *
                        1024 *
                        1024,

                    CpuQuota:
                        50000,

                    NetworkMode:
                        "none"
                }
            });

        await container.start();

        const timeout =
            setTimeout(
                async () => {
                    timedOut =
                        true;

                    try {
                        await container.kill();
                    } catch {}
                },
                10000
            );

        const waitResult =
            await container.wait();

        clearTimeout(
            timeout
        );

        const logs =
            await container.logs({
                stdout: true,
                stderr: true
            });

        const output =
            cleanDockerLogs(
                logs
            );

        return {
            run: {
                code: waitResult.StatusCode,

                stdout:
                    waitResult.StatusCode ===
                    0
                        ? output
                        : "",

                stderr:
                    waitResult.StatusCode !==
                    0
                        ? output
                        : "",

                timedOut
            }
        };
    } catch (error) {
        if (error.message.includes("connect") || error.message.includes("docker") || error.message.includes("daemon")) {
            console.warn("⚠️ Docker daemon is offline. Returning connection error.");
            return {
                run: {
                    code: 1,
                    stdout: "",
                    stderr: "System Error: Docker execution service is offline or unreachable.",
                    timedOut: false
                }
            };
        }
        return {
            run: {
                code: 1,
                stdout: "",
                stderr: error.message,
                timedOut: false
            }
        };
    } finally {
        try {
            if (
                container
            ) {
                await container.remove(
                    {
                        force: true
                    }
                );
            }
        } catch {}

        try {
            await fs.rm(
                tempDir,
                {
                    recursive: true,
                    force: true
                }
            );
        } catch {}
    }
}

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

export async function evaluateSubmission(code, language, problem) {
    if (!problem || !problem.testCases?.length) {
        throw new Error("No test cases available for the problem");
    }

    let passedCount = 0;
    let finalStatus = "Accepted";
    const results = [];
    let generalError = null;

    try {
        for (const [index, testCase] of problem.testCases.entries()) {
            const result = await runDocker(
                code,
                testCase.input,
                language,
                testCase.expectedOutput
            );

            const outputText =
                result.run.stdout ||
                result.run.stderr ||
                "";

            const expected = formatExpectedOutput(testCase.expectedOutput);
            let passed = false;
            let status = "Accepted";

            if (result.run.timedOut) {
                status = "Time Limit Exceeded";
                finalStatus = "Time Limit Exceeded";
            } else if (result.run.code !== 0) {
                status = "Runtime Error";
                if (finalStatus !== "Time Limit Exceeded") {
                    finalStatus = "Runtime Error";
                }
                generalError = outputText;
            } else {
                passed = compareOutputs(outputText.trim(), expected);
                if (!passed) {
                    status = "Wrong Answer";
                    if (finalStatus === "Accepted") {
                        finalStatus = "Wrong Answer";
                    }
                }
            }

            if (passed) {
                passedCount++;
            }

            results.push({
                testCase: index + 1,
                input: testCase.input,
                expectedOutput: expected,
                output: outputText.trim(),
                passed,
                status
            });
        }
    } catch (err) {
        finalStatus = "Runtime Error";
        generalError = err.message;
    }

    return {
        status: finalStatus,
        testCasesPassed: passedCount,
        totalTestCases: problem.testCases.length,
        error: generalError,
        testResults: results
    };
}