import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PacmanLoader } from "react-spinners";
import { serverURL } from "../App";
import Navbar from "../components/Navbar";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

function SelectProblemPage() {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userData } = useUser();
  const [numberOfProblems, setNumberOfProblems] = useState(1);
  const [duration, setDuration] = useState(60);
  const [selectedDifficulties, setSelectedDifficulties] = useState({
    1: "easy",
    2: "medium",
    3: "hard",
  });
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const topics = [
    "Array",
    "String",
    "Hash Table",
    "Dynamic Programming",
    "Math",
    "Sorting",
    "Greedy",
    "Depth-First Search",
    "Binary Search",
    "Matrix",
    "Bit Manipulation",
    "Tree",
    "Breadth-First Search",
    "Two Pointers",
    "Prefix Sum",
    "Heap (Priority Queue)",
    "Simulation",
    "Counting",
    "Graph",
    "Binary Tree",
    "Stack",
    "Sliding Window",
    "Backtracking",
    "Union Find",
    "Linked List",
    "Monotonic Stack",
    "Segment Tree",
    "Trie",
    "Divide and Conquer",
    "Queue",
    "Recursion",
    "Binary Indexed Tree",
    "Memoization",
    "Binary Search Tree",
    "Topological Sort",
    "Monotonic Queue",
    "Doubly-Linked List",
    "Merge Sort",
    "Counting Sort",
  ];

  const pointsMap = {
    easy: 3,
    medium: 4,
    hard: 6,
  };

  const calculateMaxPoints = () => {
    let total = 0;
    for (let i = 1; i <= numberOfProblems; i++) {
      const difficulty = selectedDifficulties[i];
      total += pointsMap[difficulty] || 0;
    }
    return total;
  };

  const maxPoints = calculateMaxPoints();

  const handleDifficultySelect = (problemIndex, difficulty) => {
    setSelectedDifficulties((prev) => ({
      ...prev,
      [problemIndex]: difficulty,
    }));
  };

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => {
      // If clicking Random
      if (topic === "Random") {
        if (prev.includes("Random")) {
          return prev.filter((t) => t !== "Random");
        }
        return ["Random"];
      }

      const withoutRandom = prev.filter((t) => t !== "Random");

      // Toggle the clicked topic
      if (withoutRandom.includes(topic)) {
        return withoutRandom.filter((t) => t !== topic);
      } else {
        return [...withoutRandom, topic];
      }
    });
  };

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      const roomConfig = {
        numberOfProblems,
        duration,
        difficulties: Object.entries(selectedDifficulties)
          .slice(0, numberOfProblems)
          .map(([_, diff]) => diff),
        topics: selectedTopics.length > 0 ? selectedTopics : ["Random"],
      };

      const res = await axios.post(
        `${serverURL}/problems/get-problems`,
        roomConfig,
        { withCredentials: true }
      );
      if (res.data.problems && res.data.problems.length < numberOfProblems) {
        toast.info(
          "Not enough problems available with the selected configuration. Please adjust your settings."
        );
      } else if (
        res.data.problems &&
        res.data.problems.length === numberOfProblems
      ) {
        const createRoomRes = await axios.post(
          `${serverURL}/rooms/create`,
          {
            hostId: userData?._id,
            problems: res.data.problems.map((p) => p._id),
            // Pass metadata so the room stores the correct duration in DB
            metadata: {
              duration: duration,
              difficulty: selectedDifficulties[0] || 'medium',
              categories: selectedTopics,
            },
          },
          { withCredentials: true }
        );
        console.log("Create Room Response:", createRoomRes.data);
        navigate("/waiting-window", {
          state: {
            problems: res.data.problems,
            metadata: { ...(res.data.metadata || {}), duration },  // always include chosen duration
            roomId: createRoomRes.data.roomId,
            isHost: true,
            host: userData || { _id: createRoomRes.data.host },
          },
        });
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Create Your Room
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Select Room Settings
              </h2>

              <div className="mb-6">
                <label className="block text-zinc-300 mb-3 text-sm font-medium">
                  Number of Problems
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumberOfProblems(num)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        numberOfProblems === num
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-600"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-zinc-300 mb-3 text-sm font-medium">
                  Duration
                </label>
                <div className="flex gap-3">
                  {[60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        duration === mins
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-600"
                      }`}
                    >
                      {mins === 90 ? "1.5hr" : `${mins / 60}hr`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Difficulty Button */}
              <button
                onClick={() => setShowDifficultyModal(true)}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all mb-4 border border-zinc-600"
              >
                Select Difficulty
              </button>

              <button
                onClick={() => setShowTopicModal(true)}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all mb-6 border border-zinc-600"
              >
                Select Topic{" "}
                {selectedTopics.length > 0 && `(${selectedTopics.length})`}
              </button>

              <button
                onClick={handleCreateRoom}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg shadow-lg transition-all"
              >
                {loading ? (
                  <PacmanLoader size={15} color="#ffffff" />
                ) : (
                  "Create Room"
                )}
              </button>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Current Configuration
              </h2>

              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <p className="text-zinc-400 text-sm mb-1">Problems</p>
                  <p className="text-white text-2xl font-bold">
                    {numberOfProblems}
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <p className="text-zinc-400 text-sm mb-1">Duration</p>
                  <p className="text-white text-2xl font-bold">
                    {duration === 90 ? "1.5" : duration / 60} hour
                    {duration > 60 ? "s" : ""}
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <p className="text-zinc-400 text-sm mb-2">
                    Difficulty per Problem
                  </p>
                  <div className="space-y-2">
                    {Array.from({ length: numberOfProblems }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span className="text-zinc-300">
                          Problem {idx + 1}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedDifficulties[idx + 1] === "easy"
                                ? "bg-green-500/20 text-green-400"
                                : selectedDifficulties[idx + 1] === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {selectedDifficulties[idx + 1]?.toUpperCase()}
                          </span>
                          <span className="text-blue-400 font-bold text-xs">
                            {pointsMap[selectedDifficulties[idx + 1]]}pt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 border-2 border-zinc-700 shadow-lg">
                  <p className="text-blue-300 text-sm mb-1 font-medium">
                    Maximum Points
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-white text-4xl font-bold">{maxPoints}</p>
                    <p className="text-blue-300 text-sm">points</p>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <p className="text-zinc-400 text-sm mb-2">Selected Topics</p>
                  {selectedTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTopics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">Random Topics</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Rules & Instructions
              </h2>

              <div className="space-y-4">
                <div className="bg-zinc-800/50 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm font-medium mb-1">
                    Fair Play
                  </p>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    The goal is to make it fair, competitive, and fun for
                    everyone. Challenge yourself and keep the spirit of
                    competition alive don’t turn it into a shortcut zone.
                  </p>
                </div>

                <div className="bg-zinc-800/50 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-400 text-sm font-medium mb-1">
                    Instructions
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 text-sm leading-relaxed">
                    <li>
                      Stay calm and focused accuracy matters more than speed.
                    </li>
                    <li>Plan your approach before jumping into the code.</li>
                    <li>Don’t copy code originality helps you improve.</li>
                  </ul>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-zinc-400 via-white to-zinc-500 bg-clip-text text-transparent">
                    Good luck, warrior! ⚔️
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Selection Modal */}
        {showDifficultyModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-zinc-700 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">
                Select Difficulty
              </h3>

              <div className="space-y-4">
                {Array.from({ length: numberOfProblems }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                  >
                    <p className="text-white font-medium mb-3 flex items-center justify-between">
                      <span>Problem {idx + 1}</span>
                      <span className="text-blue-400 text-sm font-bold">
                        {pointsMap[selectedDifficulties[idx + 1]] || 0} pts
                      </span>
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {["easy", "medium", "hard"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => handleDifficultySelect(idx + 1, diff)}
                          className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                            selectedDifficulties[idx + 1] === diff
                              ? diff === "easy"
                                ? "bg-green-600 text-white"
                                : diff === "medium"
                                ? "bg-yellow-600 text-white"
                                : "bg-red-600 text-white"
                              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border border-zinc-600"
                          }`}
                        >
                          <div>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </div>
                          <div className="text-xs opacity-75">
                            {pointsMap[diff]}pt
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowDifficultyModal(false)}
                className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Topic Selection Modal */}
        {showTopicModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full border border-zinc-700 shadow-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6">
                Select Topics
              </h3>

              <div className="mb-6">
                <button
                  onClick={() => toggleTopic("Random")}
                  className={`w-full py-4 px-4 rounded-lg font-bold text-base transition-all ${
                    selectedTopics.includes("Random")
                      ? "bg-purple-600 text-white shadow-lg border-2 border-purple-400"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-2 border-zinc-600"
                  }`}
                >
                  🎲 Random Topics
                </button>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-zinc-600"></div>
                <span className="px-3 text-zinc-400 text-sm">
                  OR SELECT SPECIFIC TOPICS
                </span>
                <div className="flex-1 border-t border-zinc-600"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                      selectedTopics.includes(topic)
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-600"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTopics([])}
                  className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all border border-zinc-600"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowTopicModal(false)}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectProblemPage;
