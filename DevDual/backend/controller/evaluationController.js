import Problem from "../model/problemModel.js";
import { runDocker } from "../services/executionService.js";

// -------------------- RUN SINGLE TEST --------------------

export const runSingleTest = async (
    req,
    res
) => {
    try {
        const {
            problemId,
            code,
            language = "cpp"
        } = req.body;

        const problem =
            await Problem.findById(
                problemId
            );

        if (!problem) {
            return res.status(404).json({
                message:
                    "Problem not found"
            });
        }

        if (
            !problem.testCases?.length
        ) {
            return res.status(404).json({
                message:
                    "No test cases available"
            });
        }

        let targetFuncName = null;
        if (problem.codeSnippets) {
            const snippet = problem.codeSnippets.find(s => s.langSlug === language);
            if (snippet && snippet.code) {
                if (language === "cpp") {
                    const match = snippet.code.match(/class\s+Solution\s*\{[\s\S]*?(?:public:\s*)?(?:static\s+)?([a-zA-Z0-9_<>\s*&]+)\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/);
                    if (match) targetFuncName = match[2].trim();
                } else if (language === "python") {
                    const match = snippet.code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
                    if (match) targetFuncName = match[1].trim();
                } else if (language === "javascript") {
                    const match = snippet.code.match(/var\s+([a-zA-Z0-9_]+)\s*=\s*function/);
                    if (match) targetFuncName = match[1].trim();
                }
            }
        }

        const testCase = problem.testCases[0];

        const result =
            await runDocker(
                code,
                testCase.input,
                language,
                testCase.expectedOutput,
                targetFuncName
            );

        const outputText =
            result.run.stdout ||
            result.run.stderr ||
            "";

        const expected =
            formatExpectedOutput(
                testCase.expectedOutput
            );

        let passed = false;
        let status = "Accepted";

        if (result.run.timedOut) {
            status = "Time Limit Exceeded";
        } else if (result.run.code !== 0) {
            status = "Runtime Error";
        } else {
            passed = compareOutputs(
                outputText.trim(),
                expected
            );

            if (!passed) {
                status = "Wrong Answer";
            }
        }

        return res.json({
            mode: "run",
            input:
                testCase.input,
            expectedOutput:
                expected,
            output:
                outputText.trim(),
            passed,
            status
        });
    } catch (err) {
        console.error(
            "Run Test Error:",
            err
        );

        res.status(500).json({
            message:
                err.message
        });
    }
};
// -------------------- SUBMIT ALL TESTS --------------------

export const submitAllTests = async (
    req,
    res
) => {
    try {
        const {
            problemId,
            code,
            language = "cpp"
        } = req.body;

        const problem =
            await Problem.findById(
                problemId
            );

        if (
            !problem ||
            !problem.testCases?.length
        ) {
            return res.status(404).json({
                message:
                    "Problem or test cases missing"
            });
        }

        let targetFuncName = null;
        if (problem.codeSnippets) {
            const snippet = problem.codeSnippets.find(s => s.langSlug === language);
            if (snippet && snippet.code) {
                if (language === "cpp") {
                    const match = snippet.code.match(/class\s+Solution\s*\{[\s\S]*?(?:public:\s*)?(?:static\s+)?([a-zA-Z0-9_<>\s*&]+)\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/);
                    if (match) targetFuncName = match[2].trim();
                } else if (language === "python") {
                    const match = snippet.code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
                    if (match) targetFuncName = match[1].trim();
                } else if (language === "javascript") {
                    const match = snippet.code.match(/var\s+([a-zA-Z0-9_]+)\s*=\s*function/);
                    if (match) targetFuncName = match[1].trim();
                }
            }
        }

        let passedCount = 0;

        let finalStatus =
            "Accepted";

        const results = [];

        for (const [
            index,
            testCase
        ] of problem.testCases.entries()) {
            const result =
                await runDocker(
                    code,
                    testCase.input,
                    language,
                    testCase.expectedOutput,
                    targetFuncName
                );

            const outputText =
                result.run.stdout ||
                result.run.stderr ||
                "";

            const expected =
                formatExpectedOutput(
                    testCase.expectedOutput
                );

            let passed = false;

            let status =
                "Accepted";

            if (
                result.run.timedOut
            ) {
                status =
                    "Time Limit Exceeded";

                finalStatus =
                    "Time Limit Exceeded";
            } else if (
                result.run.code !== 0
            ) {
                status =
                    "Runtime Error";

                if (
                    finalStatus !==
                    "Time Limit Exceeded"
                ) {
                    finalStatus =
                        "Runtime Error";
                }
            } else {
                passed =
                    compareOutputs(
                        outputText.trim(),
                        expected
                    );

                if (!passed) {
                    status =
                        "Wrong Answer";

                    if (
                        finalStatus ===
                        "Accepted"
                    ) {
                        finalStatus =
                            "Wrong Answer";
                    }
                }
            }

            if (passed) {
                passedCount++;
            }

            results.push({
                testCase:
                    index + 1,
                input:
                    testCase.input,
                expectedOutput:
                    expected,
                output:
                    outputText.trim(),
                passed,
                status
            });
        }

        res.json({
            mode: "submit",
            status: finalStatus,

            totalTests:
                problem.testCases
                    .length,

            passedTests:
                passedCount,

            allPassed:
                passedCount ===
                problem.testCases
                    .length,

            results
        });
        
    } catch (err) {
        console.error(
            "Submit Tests Error:",
            err
        );

        res.status(500).json({
            message: err.message
        });
    }
};

// -------------------- HELPERS --------------------

function formatExpectedOutput(
    output
) {
    if (
        output === null ||
        output === undefined
    ) {
        return "null";
    }

    if (
        typeof output ===
        "string"
    ) {
        return output.trim();
    }

    if (
        typeof output ===
        "boolean"
    ) {
        return output
            ? "true"
            : "false";
    }

    if (
        Array.isArray(output)
    ) {
        return JSON.stringify(
            output
        );
    }

    return String(
        output
    ).trim();
}

function compareOutputs(
    actual,
    expected
) {
    const actualTrimmed =
        String(actual).trim();

    const expectedTrimmed =
        String(expected).trim();

    // Exact string match
    if (
        actualTrimmed ===
        expectedTrimmed
    ) {
        return true;
    }

    // JSON comparison
    try {
        const actualJson =
            JSON.parse(
                actualTrimmed
            );

        const expectedJson =
            JSON.parse(
                expectedTrimmed
            );

        if (
            typeof actualJson ===
                "object" &&
            actualJson !== null &&
            typeof expectedJson ===
                "object" &&
            expectedJson !== null
        ) {
            return (
                JSON.stringify(
                    actualJson
                ) ===
                JSON.stringify(
                    expectedJson
                )
            );
        }
    } catch {}

    // Numeric comparison
    const actualNum =
        Number(actualTrimmed);

    const expectedNum =
        Number(expectedTrimmed);

    if (
        Number.isFinite(
            actualNum
        ) &&
        Number.isFinite(
            expectedNum
        )
    ) {
        return (
            Math.abs(
                actualNum -
                    expectedNum
            ) < 0.0001
        );
    }

    return false;
}