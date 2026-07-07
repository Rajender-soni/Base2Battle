import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useBattle } from "../../context/BattleContext";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import { socket } from "../../socket";

function ProblemNavbar({ problems, currentIndex, onProblemSelect, metadata }) {
  const navigate = useNavigate();
  const { resetBattle, battleData, serverTimeOffset } = useBattle();
  const { userData } = useUser();
  const [showEndBattleModal, setShowEndBattleModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("--:--:--");
  const [opponentSolvedProblems, setOpponentSolvedProblems] = useState(new Set());
  const [userSolvedProblems, setUserSolvedProblems] = useState(new Set());

  const formatTime = (ms) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!metadata?.duration) {
      // No duration configured, show placeholder
      setTimeLeft(formatTime(0));
      return;
    }

    // If battle hasn't started yet, show full duration
    if (!battleData.startTime) {
      setTimeLeft(formatTime(metadata.duration * 60 * 1000));
      return;
    }

    const totalDurationMs = metadata.duration * 60 * 1000;
    const endTime = battleData.startTime + totalDurationMs;

    const getRemainingMs = () => {
      const now = Date.now() + (serverTimeOffset || 0);
      return endTime - now;
    };

    setTimeLeft(formatTime(Math.max(getRemainingMs(), 0)));

    const timerInterval = setInterval(() => {
      const remainingMs = getRemainingMs();

      if (remainingMs <= 0) {
        clearInterval(timerInterval);
        setTimeLeft(formatTime(0));
        toast.error("Time's up! Battle has ended.");

        if (battleData.roomId && battleData.matchId && userData?._id) {
          socket.emit("end-match", {
            roomId: battleData.roomId,
            matchId: battleData.matchId,
            userId: userData._id
          });
        }
      } else {
        setTimeLeft(formatTime(remainingMs));
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [metadata?.duration, battleData.startTime, serverTimeOffset, battleData.roomId, battleData.matchId, userData]);

  // Listen for opponent submissions and handle cleanup on unmount
  useEffect(() => {
    // Re-join the room immediately in case of page reload!
    if (battleData?.roomId && userData?._id) {
      socket.emit("join-room", {
        roomId: battleData.roomId,
        userId: userData._id,
        name: userData.name,
        photoURL: userData.photoURL
      });
    }

    const handleOpponentSubmitted = ({ userId, problemId, result }) => {
      console.log(`[Progress] Opponent (${userId}) submitted for problem ${problemId}:`, result);
      if (result?.allPassed) {
        setOpponentSolvedProblems((prev) => new Set([...prev, problemId]));
        toast.info(`🔥 Opponent solved a problem!`);
      } else {
        toast.info(`⚠️ Opponent attempted problem (${result?.passedTests}/${result?.totalTests} passed)`);
      }
    };

    const handleMySubmission = ({ userId, problemId, result }) => {
      console.log(`[Progress] You submitted for problem ${problemId}:`, result);
      if (result?.allPassed) {
        setUserSolvedProblems((prev) => new Set([...prev, problemId]));
        toast.success(`✅ You solved a problem!`);
      }
    };

    const handleOpponentChangedProblem = ({ problemIndex, userId }) => {
      console.log(`[Progress] Opponent changed to problem ${problemIndex}`);
    };

    // Handle browser tab closing or page reload during match
    const handleBeforeUnload = (e) => {
      if (battleData.roomId && userData?._id) {
        socket.emit("leave-room", { roomId: battleData.roomId, userId: userData._id });
      }
    };

    socket.on("opponent-submitted", handleOpponentSubmitted);
    socket.on("my-submission", handleMySubmission);
    socket.on("opponent-changed-problem", handleOpponentChangedProblem);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.off("opponent-submitted", handleOpponentSubmitted);
      socket.off("my-submission", handleMySubmission);
      socket.off("opponent-changed-problem", handleOpponentChangedProblem);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Emit leave-room when component unmounts (navigation away from match)
      if (battleData.roomId && userData?._id) {
        console.log(`Cleanup: Leaving room ${battleData.roomId} from match`);
        socket.emit("leave-room", { roomId: battleData.roomId, userId: userData._id });
      }
    };
  }, [problems, battleData.roomId, userData]); // Include battleData.roomId and userData

  const handleEndBattle = () => {
    // Emit end-match event
    if (battleData.roomId && battleData.matchId && userData?._id) {
      console.log(`Ending battle - ending match ${battleData.matchId}`);
      socket.emit("end-match", {
        roomId: battleData.roomId,
        matchId: battleData.matchId,
        userId: userData._id,
      });
    }
    // Emit leave-room event before navigating away
    if (battleData.roomId && userData?._id) {
      console.log(`Ending battle - leaving room ${battleData.roomId}`);
      socket.emit("leave-room", { roomId: battleData.roomId, userId: userData._id });
    }
    resetBattle();
    navigate("/battle");
  };

  const totalProblems = problems?.length || 0;
  
  // Build player progress from local state (you) and opponent submissions tracked via socket
  const playerProgress = {
    you: {
      name: "You",
      role: battleData.isHost ? "Host" : "Opponent",
      problems: Array.from({ length: totalProblems }, (_, i) => ({
        id: i + 1,
        problemId: problems[i]?._id,
        status: userSolvedProblems.has(problems[i]?._id) ? "solved" : "unsolved",
      })),
    },
    opponent: {
      name: battleData.isHost ? "Opponent" : "Host",
      role: battleData.isHost ? "Opponent" : "Host",
      problems: Array.from({ length: totalProblems }, (_, i) => ({
        id: i + 1,
        problemId: problems[i]?._id,
        status: opponentSolvedProblems.has(problems[i]?._id) ? "solved" : "unsolved",
      })),
    },
  };

  const getSolvedCount = (playerProblems) => {
    return playerProblems.filter((p) => p.status === "solved").length;
  };

  return (
    <>
      <nav className="bg-zinc-900 border-b border-zinc-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                resetBattle();
                navigate("/battle");
              }}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <div className="h-6 w-px bg-zinc-700"></div>
            <h1 className="text-white font-bold text-lg">Dev Dual</h1>
          </div>

          <div className="flex items-center gap-2">
            {problems?.map((problem, idx) => (
              <button
                key={problem._id}
                onClick={() => onProblemSelect(idx)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  idx === currentIndex
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {metadata && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400">Time:</span>
                  <span className="text-white font-semibold font-mono">{timeLeft}</span>
                </div>
                <div className="h-4 w-px bg-zinc-700"></div>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400">Total:</span>
                  <span className="text-white font-semibold">{metadata.totalProblems}</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowProgressModal(true)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm"
            >
              Progress
            </button>
            <button
              onClick={() => setShowEndBattleModal(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm"
            >
              End Battle
            </button>
          </div>
        </div>
      </nav>

      {showProgressModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full border border-zinc-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Battle Progress</h3>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <p className="text-green-400 font-semibold">Your Progress</p>
                <p className="text-white text-2xl font-bold mt-1">
                  {getSolvedCount(playerProgress.you.problems)}/{playerProgress.you.problems.length}
                </p>
              </div>
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <p className="text-blue-400 font-semibold">Opponent Progress</p>
                <p className="text-white text-2xl font-bold mt-1">
                  {getSolvedCount(playerProgress.opponent.problems)}/{playerProgress.opponent.problems.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* You */}
              <div className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-700">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-white">{playerProgress.you.name}</h4>
                  <p className="text-sm text-zinc-400">{playerProgress.you.role}</p>
                </div>

                <div className="space-y-3">
                  {playerProgress.you.problems.map((problem) => (
                    <div
                      key={problem.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        problem.status === "solved"
                          ? "bg-green-900/20 border border-green-700/50"
                          : "bg-red-900/20 border border-red-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            problem.status === "solved" ? "bg-green-600" : "bg-red-600"
                          }`}
                        >
                          {problem.status === "solved" ? (
                            <FaCheck className="text-white text-xs" />
                          ) : (
                            <FaTimes className="text-white text-xs" />
                          )}
                        </div>
                        <span className="text-white font-medium">Problem {problem.id}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          problem.status === "solved" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {problem.status === "solved" ? "Solved" : "Unsolved"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Solved:</span>
                    <span className="text-white font-bold text-lg">
                      {getSolvedCount(playerProgress.you.problems)}/
                      {playerProgress.you.problems.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent */}
              <div className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-700">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-white">{playerProgress.opponent.name}</h4>
                  <p className="text-sm text-zinc-400">{playerProgress.opponent.role}</p>
                </div>

                <div className="space-y-3">
                  {playerProgress.opponent.problems.map((problem) => (
                    <div
                      key={problem.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        problem.status === "solved"
                          ? "bg-green-900/20 border border-green-700/50"
                          : "bg-red-900/20 border border-red-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            problem.status === "solved" ? "bg-green-600" : "bg-red-600"
                          }`}
                        >
                          {problem.status === "solved" ? (
                            <FaCheck className="text-white text-xs" />
                          ) : (
                            <FaTimes className="text-white text-xs" />
                          )}
                        </div>
                        <span className="text-white font-medium">Problem {problem.id}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          problem.status === "solved" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {problem.status === "solved" ? "Solved" : "Unsolved"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Solved:</span>
                    <span className="text-white font-bold text-lg">
                      {getSolvedCount(playerProgress.opponent.problems)}/
                      {playerProgress.opponent.problems.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProgressModal(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEndBattleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-zinc-700 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">End Battle?</h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to end this battle? Your progress will be saved and you'll
              return to the battle selection screen.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEndBattleModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndBattle}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                End Battle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProblemNavbar;
