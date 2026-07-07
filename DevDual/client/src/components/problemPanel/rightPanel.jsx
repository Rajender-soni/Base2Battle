import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { toast } from "react-toastify";
import { useBattle } from "../../context/BattleContext";
import { useUser } from "../../context/UserContext";
import OutputPanel from "./OutputPanel";
import { runCode, submitCode } from "./editorUtils";
import { socket } from "../../socket";

function RightPanel({ problem }) {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const { saveUserCode, getUserCode, battleData } = useBattle();
  const { userData } = useUser();

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [panelHeight, setPanelHeight] = useState(250);
  const dragRef = useRef(false);

  // Load user code
  useEffect(() => {
    if (!problem?._id) return;
    const saved = getUserCode(problem._id, language);
    if (saved) setCode(saved);
    else {
      const snippet = problem.codeSnippets?.find((s) => s.langSlug === language);
      setCode(
        snippet?.code ||
        `// Write your ${language} code here`
      );
    }
  }, [problem, language]);

  // Auto save
  useEffect(() => {
    if (problem?._id && code) saveUserCode(problem._id, language, code);
  }, [code, language]);

  // Run
  const handleRun = async () => {
    if (!code.trim()) return toast.error("Write some code first");
    setIsRunning(true);
    setShowOutput(true);
    try {
      const data = await runCode(SERVER_URL, problem._id, code, language);
      setOutput({ mode: "run", ...data });
    } catch (err) {
      console.error('Run error:', err);
      toast.error(err.message || "Failed to run code. Please make sure you're logged in.");
      if (err.message.includes("No token found")) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!code.trim()) return toast.error("Write some code first");
    setIsSubmitting(true);
    setShowOutput(true);
    try {
      const data = await submitCode(SERVER_URL, problem._id, code, language);
      setOutput({ mode: "submit", ...data });
      if (data.allPassed) toast.success("🎉 All test cases passed!");
      else toast.warning(`${data.passedTests}/${data.totalTests} passed`);

      // Emit socket event to notify server/opponent of submission and update progress
      if (battleData?.roomId && userData?._id) {
        socket.emit("code-submitted", {
          roomId: battleData.roomId,
          userId: userData._id,
          problemId: problem._id,
          code: code,
          language: language,
          result: data,
        });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Draggable output
  const startDrag = () => (dragRef.current = true);
  const stopDrag = () => (dragRef.current = false);
  const handleDrag = (e) => {
    if (dragRef.current) {
      const newHeight = Math.max(150, window.innerHeight - e.clientY - 60);
      setPanelHeight(newHeight);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium">Language:</span>
          <span className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm">
            C++
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 disabled:opacity-50 transition"
          >
            {isRunning ? "Running..." : "▶ Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language === "c" ? "c" : language === "cpp" ? "cpp" : language}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Draggable Divider */}
      <div
        onMouseDown={startDrag}
        className="h-2 bg-zinc-800 cursor-row-resize hover:bg-zinc-600 transition"
      />

      {/* Output Panel */}
      <div
        style={{ height: `${panelHeight}px` }}
        className="border-t border-zinc-700 overflow-y-auto transition-all p-4"
      >
        <OutputPanel
          showOutput={showOutput}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          problem={problem}
          output={output}
        />
      </div>
    </div>
  );
}

export default RightPanel;
