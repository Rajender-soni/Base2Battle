import { useState, useEffect } from "react";
import {
  FaBolt,
  FaBrain,
  FaBug,
  FaTrophy,
  FaTimes,
  FaHourglassHalf,
  FaFire,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

// --- Mock Database ---
// This component now contains the full analysis data.
const mockMatchDatabase = {
  abcd123: {
    matchId: "abcd123",
    opponent: "CodeNinja",
    result: "Win",
    score: "250 pts",
    duration: "48:12",
    takeaways: [
      {
        icon: FaBolt,
        color: "text-yellow-400",
        title: "Blazing Fast Start",
        description:
          "You tackled Problem 1 with incredible speed, submitting a correct solution in just 12 minutes.",
      },
      {
        icon: FaBrain,
        color: "text-blue-400",
        title: 'The MVP "Thinking Brake"',
        description:
          "Your 4-minute idle 'brake' at 28:00 was the match-winning move. You re-evaluated and found the path.",
      },
      {
        icon: FaBug,
        color: "text-red-400",
        title: "Systematic Debugging",
        description:
          "A tricky edge case in Problem 2 caught you for 10 minutes, but you systematically worked through it.",
      },
    ],
    cognitiveFlowData: [
      { time: 0, flow: 0 },
      { time: 5, flow: -10, label: "Reading Problems" },
      { time: 12, flow: 100, label: "P1 Solved!" },
      { time: 14, flow: -10 },
      { time: 18, flow: 50 },
      { time: 28, flow: 60, label: "Initial P2 Attempt" },
      { time: 32, flow: -50, label: "Thinking Brake" },
      { time: 38, flow: -100, label: "Debug Loop (Stuck)" },
      { time: 42, flow: -90 },
      { time: 48, flow: 100, label: "P2 Solved!" },
      { time: 60, flow: 0 },
    ],
    problems: [
      {
        name: "Problem 1: API Route",
        points: "100 Pts",
        stats: [
          { label: "Total Time Spent", value: "12:34" },
          { label: "Submissions", value: "1" },
          { label: "Failed Attempts", value: "0", status: "fail" },
          { label: "Final Result", value: "Passed", status: "pass" },
        ],
      },
      {
        name: "Problem 2: State Bug",
        points: "150 Pts",
        stats: [
          { label: "Total Time Spent", value: "33:18" },
          { label: "Submissions", value: "4" },
          { label: "Failed Attempts", value: "3", status: "fail" },
          { label: "Final Result", value: "Passed", status: "pass" },
        ],
      },
    ],
  },
  xyz789: {
    matchId: "xyz789",
    opponent: "SyntaxSlayer",
    result: "Loss",
    score: "100 pts",
    duration: "60:00",
    takeaways: [
      {
        icon: FaBug,
        color: "text-red-400",
        title: "The Unsolved Problem",
        description:
          "Problem 2's edge cases proved very difficult. You spent over 30 minutes in a debug loop.",
      },
      {
        icon: FaHourglassHalf,
        color: "text-yellow-400",
        title: "Time Management",
        description:
          "The 'hotspot' on P2 consumed most of your time, leaving no room to review other problems.",
      },
    ],
    cognitiveFlowData: [
      { time: 0, flow: 0 },
      { time: 4, flow: -10, label: "Reading Problems" },
      { time: 15, flow: 80, label: "P1 Solved!" },
      { time: 20, flow: -10, label: "Reading P2" },
      { time: 25, flow: 40, label: "Initial P2 Code" },
      { time: 30, flow: -80, label: "First Fail" },
      { time: 35, flow: -100, label: "Debug Loop" },
      { time: 45, flow: -100, label: "Stuck" },
      { time: 60, flow: -90, label: "Match End" },
    ],
    problems: [
      {
        name: "Problem 1: API Route",
        points: "100 Pts",
        stats: [
          { label: "Total Time Spent", value: "15:21" },
          { label: "Submissions", value: "1" },
          { label: "Failed Attempts", value: "0", status: "fail" },
          { label: "Final Result", value: "Passed", status: "pass" },
        ],
      },
      {
        name: "Problem 2: State Bug",
        points: "150 Pts",
        stats: [
          { label: "Total Time Spent", value: "44:39" },
          { label: "Submissions", value: "8" },
          { label: "Failed Attempts", value: "8", status: "fail" },
          { label: "Final Result", value: "Failed", status: "fail" },
        ],
      },
    ],
  },
  qwe456: {
    matchId: "qwe456",
    opponent: "AsyncMaster",
    result: "Win",
    score: "180 pts",
    duration: "58:12",
    takeaways: [
      {
        icon: FaHourglassHalf,
        color: "text-green-400",
        title: "Last Minute Clutch",
        description:
          "You solved Problem 3 with only 2 minutes to spare! An amazing comeback.",
      },
      {
        icon: FaBrain,
        color: "text-blue-400",
        title: "Smart Skip",
        description:
          "You correctly identified Problem 2 as a time-sink and skipped it to focus on P1 and P3. Great strategy.",
      },
    ],
    cognitiveFlowData: [
      { time: 0, flow: 0 },
      { time: 5, flow: -10, label: "Reading All" },
      { time: 10, flow: -80, label: "Stuck on P1" },
      { time: 25, flow: 80, label: "P1 Solved!" },
      { time: 30, flow: -20, label: "Skipped P2" },
      { time: 35, flow: 30, label: "Coding P3" },
      { time: 58, flow: 100, label: "P3 Solved!" },
      { time: 60, flow: 0 },
    ],
    problems: [
      {
        name: "Problem 1: Palindrome Check",
        points: "80 Pts",
        stats: [
          { label: "Total Time Spent", value: "25:10" },
          { label: "Submissions", value: "3" },
          { label: "Failed Attempts", value: "2", status: "fail" },
          { label: "Final Result", value: "Passed", status: "pass" },
        ],
      },
      {
        name: "Problem 2: LRU Cache",
        points: "200 Pts",
        stats: [
          { label: "Total Time Spent", value: "05:00" },
          { label: "Submissions", value: "0" },
          { label: "Failed Attempts", value: "0", status: "fail" },
          { label: "Final Result", value: "Skipped", status: "fail" },
        ],
      },
      {
        name: "Problem 3: Two Sum",
        points: "100 Pts",
        stats: [
          { label: "Total Time Spent", value: "28:02" },
          { label: "Submissions", value: "2" },
          { label: "Failed Attempts", value: "1", status: "fail" },
          { label: "Final Result", value: "Passed", status: "pass" },
        ],
      },
    ],
  },
};

/**
 * -----------------------------------------------------------------
 * Main Modal Component
 * -----------------------------------------------------------------
 */
function MatchAnalysis({ matchId, onClose }) {
  const [matchData, setMatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching data when component mounts
  // Fetch real data from the backend
  useEffect(() => {
    setIsLoading(true);
    const fetchReport = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/submissions/report/${matchId}`, {
          credentials: 'include'   // use cookie-based auth (same as rest of app)
        });
        if (!response.ok) {
           const err = await response.json().catch(() => ({}));
           throw new Error(err.error || "Failed to fetch match report");
        }
        const data = await response.json();
        setMatchData(data);
      } catch (error) {
        console.error("Error fetching match report:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [matchId]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white border border-zinc-700 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* --- Modal Header --- */}
        <div className="flex-shrink-0 p-6 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">
            Post-Match Analysis
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* --- Modal Body (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading || !matchData ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <FaHourglassHalf className="text-4xl text-blue-400 animate-spin" />
            </div>
          ) : (
            <LoadedMatchData matchData={matchData} />
          )}
        </div>
      </div>
    </div>
  );
}

// Component to render once data is loaded
const LoadedMatchData = ({ matchData }) => {
  const {
    matchId,
    opponent,
    result,
    score,
    duration,
    takeaways,
    cognitiveFlowData,
    problems,
  } = matchData;

  return (
    <div>
      {/* --- 1. Report Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <p className="text-zinc-400 text-lg mt-2">
            Match ID: <span className="font-mono">{matchId}</span>
          </p>
        </div>
        <div
          className={`text-2xl font-bold flex items-center gap-2 p-3 rounded-lg mt-4 md:mt-0 ${
            result === "Win"
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          {result === "Win" ? (
            <FaTrophy className="text-yellow-400" />
          ) : (
            <FaTimes />
          )}
          <span>{result}</span>
        </div>
      </div>

      {/* --- Sub-Header Details --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <InfoCard label="Opponent" value={opponent} />
        <InfoCard label="Score" value={score} />
        <InfoCard label="Duration" value={duration} />
        <InfoCard
          label="Rank"
          value={result === "Win" ? "Rank Up!" : "No Change"}
          className={result === "Win" ? "text-green-400" : "text-zinc-400"}
        />
      </div>

      {/* --- 2. Key Takeaways --- */}
      <h2 className="text-3xl font-bold mb-6 text-white">Key Takeaways</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {takeaways.map((item, index) => {
          // Map color/title to an icon since backend doesn't send icon components
          const IconComponent =
            item.title?.toLowerCase().includes("victory") || item.title?.toLowerCase().includes("win")
              ? FaTrophy
              : item.title?.toLowerCase().includes("persist")
              ? FaFire
              : item.title?.toLowerCase().includes("tough") || item.title?.toLowerCase().includes("fail")
              ? FaBug
              : item.title?.toLowerCase().includes("solid") || item.title?.toLowerCase().includes("effort")
              ? FaCheckCircle
              : item.color?.includes("yellow")
              ? FaExclamationTriangle
              : item.color?.includes("green")
              ? FaTrophy
              : item.color?.includes("blue")
              ? FaChartLine
              : FaBrain;

          return (
            <div
              key={index}
              className="bg-zinc-800/70 border border-zinc-700 rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-zinc-500 hover:-translate-y-1"
            >
              <IconComponent
                className={`text-3xl mb-4 ${item.color || "text-blue-400"}`}
              />
              <h3 className="text-xl font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-sm">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* --- 3. Cognitive Flow Graph --- */}
      <h2 className="text-3xl font-bold mb-6 text-white">
        Cognitive Flow (Match EKG)
      </h2>
      <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl p-6 shadow-lg backdrop-blur-sm mb-12 h-[400px]">
        <CognitiveFlowChart data={cognitiveFlowData} />
      </div>
      
      {/* ... (Strategic Hotspot could go here) ... */}

      {/* --- 5. Problem Breakdown --- */}
      <h2 className="text-3xl font-bold mb-6 text-white">
        Problem Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((problem) => (
          <ProblemCard
            key={problem.name}
            title={problem.name}
            points={problem.points}
            stats={problem.stats}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * -----------------------------------------------------------------
 * Reusable Sub-Components
 * -----------------------------------------------------------------
 */

// --- Card for top-level stats ---
const InfoCard = ({ label, value, className = "" }) => (
  <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl p-4 shadow-md">
    <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className={`text-xl font-semibold text-white ${className}`}>{value}</p>
  </div>
);

// --- Card for problem breakdown ---
const ProblemCard = ({ title, points, stats }) => (
  <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl p-6 shadow-lg backdrop-blur-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <span className="text-sm font-mono text-blue-400">{points}</span>
    </div>
    <div className="space-y-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex justify-between items-center border-b border-zinc-700 pb-2 last:border-b-0"
        >
          <span className="text-zinc-400 text-sm">{stat.label}</span>
          <span
            className={`text-sm font-medium font-mono ${
              stat.status === "pass"
                ? "text-green-400"
                : stat.status === "fail"
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// --- The "Wow Factor" Chart Component ---
const CognitiveFlowChart = ({ data }) => {
  const yAxisFormatter = (value) => {
    if (value === 100) return "Flow";
    if (value === 0) return "Baseline";
    if (value === -100) return "Stuck";
    if (value === -50) return "Brake";
    return "";
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FF7F" stopOpacity={0.6} />
            <stop offset="50%" stopColor="#00AFFF" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#FF4136" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          unit="m"
          stroke="#888"
          tick={{ fill: "#aaa", fontSize: 12 }}
          tickLine={{ stroke: "#555" }}
        />
        <YAxis
          domain={[-100, 100]}
          ticks={[-100, -50, 0, 100]}
          tickFormatter={yAxisFormatter}
          stroke="#888"
          tick={{ fill: "#aaa", fontSize: 12 }}
          tickLine={{ stroke: "#555" }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#00AFFF", strokeWidth: 1, strokeDasharray: "3 3" }}
        />
        <ReferenceLine
          y={0}
          stroke="#aaa"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        {data.map(
          (entry) =>
            entry.label && (
              <ReferenceDot
                key={entry.time}
                x={entry.time}
                y={entry.flow}
                r={5}
                fill={
                  entry.flow >= 80
                    ? "#00FF7F"
                    : entry.flow <= -80
                    ? "#FF4136"
                    : "#00AFFF"
                }
                stroke="#1e1e1e"
                strokeWidth={2}
              />
            )
        )}
        <Area
          type="monotone"
          dataKey="flow"
          stroke="#00AFFF"
          strokeWidth={2.5}
          fill="url(#colorFlow)"
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// --- Custom Tooltip for the chart ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let stateLabel = "Baseline";
    if (data.flow > 50) stateLabel = "Peak Flow";
    else if (data.flow > 0) stateLabel = "Coding";
    else if (data.flow < -75) stateLabel = "Stuck (Debug)";
    else if (data.flow < -25) stateLabel = "Thinking Brake";

    return (
      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-md shadow-lg text-sm">
        <p className="text-zinc-400 font-mono">Time: {label} min</p>
        <p className="text-white font-semibold">State: {stateLabel}</p>
        {data.label && (
          <p className="text-blue-400 italic mt-1">{data.label}</p>
        )}
      </div>
    );
  }
  return null;
};

export default MatchAnalysis;