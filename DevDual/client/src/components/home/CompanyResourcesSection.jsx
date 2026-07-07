import { useNavigate } from "react-router-dom";
import { ArrowRight, Files, Brain, Sparkles } from "lucide-react";

function CompanyResourcesSection() {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-24 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-full border border-zinc-700 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-sm md:text-base font-semibold text-zinc-200">
              Practice for Top Tech Companies
            </span>
            <div className="flex gap-2 items-center">
              <img src="/maang.png" alt="Top Companies" className="h-6 w-auto opacity-90" />
            </div>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Company-Wise Problem Sheets */}
          <div
            onClick={() => navigate("/sheets")}
            className="group relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg rounded-3xl border-2 border-zinc-800 hover:border-blue-500 p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] cursor-pointer overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Files className="w-10 h-10 text-blue-400" />
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                Company-Wise Problem Sheets
              </h3>

              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                Access curated LeetCode problems organized by 150+ top tech companies. Practice the exact questions asked in real interviews.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium">
                  150+ Companies
                </span>
                <span className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium">
                  2800+ Problems
                </span>
                <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400 font-medium">
                  Free Access
                </span>
              </div>
            </div>

            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>
          </div>

          {/* System Design Resources */}
          <div
            onClick={() => navigate("/system-design")}
            className="group relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-lg rounded-3xl border-2 border-zinc-800 hover:border-orange-500 p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(249,115,22,0.3)] cursor-pointer overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors duration-300">
                  <Brain className="w-10 h-10 text-orange-400" />
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 group-hover:bg-clip-text transition-all duration-300">
                System Design Notes
              </h3>

              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                Comprehensive system design guides with real-world examples. Master scalability, databases, caching, and distributed systems.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium">
                  50+ Topics
                </span>
                <span className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium">
                  Visual Diagrams
                </span>
                <span className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-sm text-orange-400 font-medium">
                  Interview Ready
                </span>
              </div>
            </div>

            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-zinc-500 text-sm italic">
            "Practice makes perfect. Start preparing for your dream company today."
          </p>
        </div>
      </div>
    </section>
  );
}

export default CompanyResourcesSection;
