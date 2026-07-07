import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles, Code2, Users, Trophy } from "lucide-react";

function HeroSection() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "<DevCompete/>";
  const typingSpeed = 100;

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);
    return () => clearInterval(typingInterval);
  }, []);

  const Cursor = () => (
    <span className="animate-pulse text-6xl md:text-8xl text-white">|</span>
  );

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center px-4 py-20 relative overflow-hidden font-[Poppins]">
      {/* Animated background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-lighten filter blur-[140px] opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-600 rounded-full mix-blend-lighten filter blur-[140px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-600 rounded-full mix-blend-lighten filter blur-[140px] opacity-15 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10 mt-10">
        {/* MAANG Badge */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 rounded-full border border-zinc-700/50 backdrop-blur-sm shadow-xl">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-sm md:text-base font-semibold text-zinc-200">
              Real time 1 vs 1 coding battles
            </span>
          </div>
        </div>

        <h1 className="text-5xl md:text-8xl font-extrabold mb-6 min-h-[100px] md:min-h-[120px] tracking-tight leading-snug select-none">
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <i>{displayedText.slice(0, 4)}</i>
          </span>
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">
            {<i>{displayedText.slice(4)}</i>}
          </span>
          <Cursor />
        </h1>

        <p className="text-zinc-400 text-base md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
          Climb the global leaderboard & show off your coding skills.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-6">
          <button
            onClick={() => navigate("/battle")}
            className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg tracking-wide shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:-translate-y-1 hover:scale-105 focus:outline-none overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Create Battle Room
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-20 group-hover:opacity-60 transition"></span>
          </button>

          <button
            onClick={() => navigate("/join-room")}
            className="group relative px-12 py-5 bg-zinc-900/80 backdrop-blur-sm text-white rounded-2xl font-bold text-lg tracking-wide border-2 border-zinc-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-orange-500 hover:bg-zinc-800 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 focus:outline-none overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join Existing Room
            </span>
            <span className="absolute inset-0 rounded-2xl border-2 border-orange-400 opacity-0 group-hover:opacity-40 transition"></span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-20 text-sm md:text-base">
          <div className="flex items-center gap-2 text-zinc-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-zinc-300">2800+ Problems</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-zinc-300">37+ Topics</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-zinc-300">Real-time Battles</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
          {[
            {
              icon: Code2,
              title: "Real-Time Battles",
              desc: "Face developers worldwide in live coding duels and climb the global leaderboard.",
              gradient: "from-blue-500/20 to-blue-600/20",
              borderColor: "border-blue-500/30",
              hoverBorder: "hover:border-blue-500",
              iconColor: "text-blue-400"
            },
            {
              icon: Trophy,
              title: "Track Progress",
              desc: "Measure your growth with detailed analytics and performance tracking.",
              gradient: "from-orange-500/20 to-orange-600/20",
              borderColor: "border-orange-500/30",
              hoverBorder: "hover:border-orange-500",
              iconColor: "text-orange-400"
            },
            {
              icon: Sparkles,
              title: "Curated DSA Sheets",
              desc: "Get all DSA sheets curated by experts in one place.",
              gradient: "from-purple-500/20 to-purple-600/20",
              borderColor: "border-purple-500/30",
              hoverBorder: "hover:border-purple-500",
              iconColor: "text-purple-400"
            },
          ].map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div
                key={i}
                className={`group relative overflow-hidden bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 rounded-2xl border-2 ${item.borderColor} ${item.hoverBorder} shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] cursor-default backdrop-blur-xl p-8`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Icon with glow */}
                <div className="relative z-10 mb-5 transition-all duration-300 group-hover:scale-110">
                  <IconComponent className={`w-14 h-14 ${item.iconColor} mx-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]`} />
                </div>

                <h3 className={`relative z-10 text-white font-bold text-2xl mb-3 tracking-tight transition-colors duration-300`}>
                  {item.title}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-zinc-400 text-base leading-relaxed">
                  {item.desc}
                </p>

                {/* Animated border gradient accent */}
                <div className="absolute inset-0 rounded-2xl opacity-30"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
