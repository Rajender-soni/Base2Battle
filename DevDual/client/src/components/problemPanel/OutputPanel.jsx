// src/components/problemPanel/OutputPanel.jsx
import { PacmanLoader } from "react-spinners";
import { renderValue, compareOutputs } from "./editorUtils";

// Detect what kind of output we got
function classifyOutput(output, status) {
  if (!output || output.trim() === "") return "empty";
  if (status === "Time Limit Exceeded") return "tle";
  if (
    status === "Runtime Error" ||
    output.includes("error:") ||
    output.includes("warning:") ||
    output.includes("undefined reference") ||
    output.includes("In function") ||
    /main\.cpp:\d+:\d+:/.test(output)
  )
    return "compile_error";
  return "ok";
}

// Parse GCC error lines into structured form
function parseGccErrors(stderr) {
  const lines = stderr.split("\n");
  const errors = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^main\.cpp:(\d+):(\d+):\s*(error|warning|note):\s*(.+)$/);
    if (match) {
      if (current) errors.push(current);
      current = {
        lineNum: parseInt(match[1]),
        col: parseInt(match[2]),
        severity: match[3],
        message: match[4],
        context: [],
      };
    } else if (current && line.trim()) {
      current.context.push(line);
    }
  }
  if (current) errors.push(current);
  return errors;
}

function CompileErrorBlock({ output }) {
  const errors = parseGccErrors(output);
  if (errors.length === 0) {
    return (
      <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
        {output}
      </pre>
    );
  }

  return (
    <div className="space-y-3">
      {errors.map((err, i) => (
        <div
          key={i}
          className={`rounded-lg border p-3 ${
            err.severity === "error"
              ? "border-red-700 bg-red-950/40"
              : err.severity === "warning"
              ? "border-yellow-700 bg-yellow-950/30"
              : "border-zinc-600 bg-zinc-900/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                err.severity === "error"
                  ? "bg-red-600 text-white"
                  : err.severity === "warning"
                  ? "bg-yellow-600 text-white"
                  : "bg-zinc-600 text-white"
              }`}
            >
              {err.severity}
            </span>
            <span className="text-zinc-400 text-xs font-mono">
              Line {err.lineNum}, Col {err.col}
            </span>
          </div>
          <p
            className={`text-sm font-medium mb-2 ${
              err.severity === "error"
                ? "text-red-300"
                : err.severity === "warning"
                ? "text-yellow-300"
                : "text-zinc-300"
            }`}
          >
            {err.message}
          </p>
          {err.context.length > 0 && (
            <pre className="text-xs font-mono text-zinc-400 bg-zinc-950 rounded p-2 overflow-x-auto whitespace-pre">
              {err.context.join("\n")}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function OutputSection({ label, content, color = "text-white", status }) {
  const kind = classifyOutput(content, status);

  return (
    <div>
      <p className={`font-medium mb-1 text-xs ${color}`}>{label}</p>
      {kind === "tle" ? (
        <div className="bg-orange-950/40 border border-orange-700 rounded-lg p-3 flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <div>
            <p className="text-orange-300 font-semibold text-sm">Time Limit Exceeded</p>
            <p className="text-orange-400 text-xs mt-0.5">Optimize your solution.</p>
          </div>
        </div>
      ) : kind === "compile_error" ? (
        <div className="bg-zinc-950 border border-red-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400">🛑</span>
            <p className="text-red-400 font-semibold text-xs">Compilation Failed</p>
          </div>
          <CompileErrorBlock output={content} />
        </div>
      ) : kind === "empty" ? (
        <pre className="bg-zinc-950 p-2 rounded text-zinc-500 text-xs font-mono">(no output)</pre>
      ) : (
        <pre className="bg-zinc-950 p-2 rounded text-white text-xs font-mono overflow-x-auto max-h-28 whitespace-pre-wrap">
          {content}
        </pre>
      )}
    </div>
  );
}

function OutputPanel({ showOutput, isRunning, isSubmitting, problem, output }) {
  if (isRunning || isSubmitting)
    return (
      <div className="flex flex-col justify-center items-center h-full gap-3">
        <PacmanLoader size={25} color="#3b82f6" />
        <p className="text-zinc-400 text-sm animate-pulse">
          {isRunning ? "Running against test case…" : "Judging all test cases…"}
        </p>
      </div>
    );

  if (!output)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500">
        <span className="text-4xl">⌨️</span>
        <p className="text-sm">
          Click <strong className="text-zinc-300">Run</strong> or{" "}
          <strong className="text-zinc-300">Submit</strong> to see results
        </p>
      </div>
    );

  // ── Submit mode ──────────────────────────────────────────────────────────────
  if (output.mode === "submit") {
    return (
      <div>
        <div
          className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${
            output.allPassed
              ? "bg-green-950/50 border border-green-700"
              : "bg-red-950/40 border border-red-700"
          }`}
        >
          <span className="text-3xl">{output.allPassed ? "🎉" : "❌"}</span>
          <div>
            <p
              className={`font-bold text-lg ${
                output.allPassed ? "text-green-400" : "text-red-400"
              }`}
            >
              {output.allPassed ? "All Test Cases Passed!" : "Some Tests Failed"}
            </p>
            <p className="text-zinc-400 text-sm">
              {output.passedTests}/{output.totalTests} test cases passed
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {output.results.map((r) => {
            const passed = compareOutputs(r.output, r.expectedOutput);
            const kind = classifyOutput(r.output, r.status);
            return (
              <div
                key={r.testCase}
                className={`rounded-xl border p-4 ${
                  passed
                    ? "border-green-700/50 bg-green-950/20"
                    : "border-red-700/50 bg-red-950/20"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`font-semibold text-sm ${
                      passed ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {passed ? "✅" : "❌"} Test Case {r.testCase}
                  </span>
                  {r.status && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono ${
                        r.status === "Accepted"
                          ? "bg-green-800/50 text-green-300"
                          : r.status === "Time Limit Exceeded"
                          ? "bg-orange-800/50 text-orange-300"
                          : "bg-red-800/50 text-red-300"
                      }`}
                    >
                      {r.status}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-zinc-400 text-xs font-medium mb-1">Input</p>
                  <pre className="bg-zinc-950 p-2 rounded text-zinc-300 text-xs font-mono overflow-x-auto max-h-20 whitespace-pre-wrap">
                    {renderValue(r.input)}
                  </pre>
                </div>

                {kind === "compile_error" || kind === "tle" ? (
                  <OutputSection
                    label="Compiler / Runtime Output"
                    content={r.output}
                    color="text-red-400"
                    status={r.status}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <OutputSection
                      label="Expected"
                      content={renderValue(r.expectedOutput)}
                      color="text-blue-400"
                      status="ok"
                    />
                    <OutputSection
                      label="Your Output"
                      content={r.output}
                      color={passed ? "text-green-400" : "text-red-400"}
                      status={r.status}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Run mode (single test) ───────────────────────────────────────────────────
  const kind = classifyOutput(output.output, output.status);
  const isError = kind === "compile_error" || kind === "tle";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isError
          ? "border-red-800 bg-red-950/20"
          : output.passed
          ? "border-green-700/50 bg-green-950/20"
          : "border-red-700/50 bg-red-950/20"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className={`font-bold text-base ${
            isError
              ? "text-red-400"
              : output.passed
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {kind === "compile_error"
            ? "🛑 Compilation Error"
            : kind === "tle"
            ? "⏰ Time Limit Exceeded"
            : output.passed
            ? "✅ Output Matched"
            : "❌ Output Mismatch"}
        </p>
        {output.status && output.status !== "Accepted" && (
          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
            {output.status}
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="text-zinc-400 text-xs font-medium mb-1">Input</p>
        <pre className="bg-zinc-950 p-2 rounded text-zinc-300 text-xs font-mono overflow-x-auto max-h-20 whitespace-pre-wrap">
          {renderValue(output.input)}
        </pre>
      </div>

      {isError ? (
        <OutputSection
          label="Compiler / Runtime Output"
          content={output.output}
          color="text-red-400"
          status={output.status}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <OutputSection
            label="Expected"
            content={renderValue(output.expectedOutput)}
            color="text-blue-400"
            status="ok"
          />
          <OutputSection
            label="Your Output"
            content={output.output}
            color={output.passed ? "text-green-400" : "text-red-400"}
            status={output.status}
          />
        </div>
      )}
    </div>
  );
}

export default OutputPanel;
