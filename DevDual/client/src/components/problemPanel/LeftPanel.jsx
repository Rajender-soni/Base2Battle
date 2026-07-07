function LeftPanel({ problem, currentIndex, totalProblems, onNext, onPrev }) {
  const createMarkup = (html) => {
    return { __html: html };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-400 bg-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "hard":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 border-r border-zinc-700 flex flex-col">
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">
            {currentIndex + 1}. {problem.title}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
          >
            ← Prev
          </button>
          <span className="text-zinc-400 text-sm">
            {currentIndex + 1} of {totalProblems}
          </span>
          <button
            onClick={onNext}
            disabled={currentIndex === totalProblems - 1}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="prose prose-invert max-w-none text-zinc-300"
          dangerouslySetInnerHTML={createMarkup(problem.content)}
        />
      </div>
    </div>
  );
}

export default LeftPanel;
