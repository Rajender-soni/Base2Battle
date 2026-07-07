import { IoSettingsSharp } from "react-icons/io5";
import { FaCode, FaChartLine, FaLaptopCode, FaTrophy } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { Zap } from "lucide-react";

function FeaturesSection() {
  const features = [
    {
      icon: IoSettingsSharp,
      title: "Custom Room Settings",
      description:
        "Choose number of problems, difficulty levels, topics, and battle duration to match your skill level.",
      color: "blue",
      stats: "Fully Customizable"
    },
    {
      icon: FaCode,
      title: "2800+ Problems",
      description:
        "Vast collection of coding challenges from easy to hard difficulty across all major topics.",
      color: "orange",
      stats: "3 Difficulty Levels"
    },
    {
      icon: FaChartLine,
      title: "Live Results",
      description: "View real-time rankings, test case results, and performance analytics as you compete.",
      color: "green",
      stats: "Real-time Updates"
    },
    {
      icon: FaLaptopCode,
      title: "Monaco Editor",
      description:
        "Professional code editor powered by VS Code with syntax highlighting, autocomplete, and IntelliSense.",
      color: "purple",
      stats: "Your Favorite IDE"
    },
    {
      icon: MdCategory,
      title: "37+ Topics",
      description:
        "Master Arrays, Trees, Graphs, DP, and more. Wide range of topics to enhance your coding skills.",
      color: "yellow",
      stats: "Comprehensive Coverage"
    },
    {
      icon: FaTrophy,
      title: "Leaderboards",
      description:
        "Track your global ranking, earn achievements, and compete with top coders worldwide.",
      color: "red",
      stats: "Global Rankings"
    },
  ];

  const getClasses = (color) => {
    switch (color) {
      case "green":
        return {
          border: "border-green-500/30 hover:border-green-500",
          shadow: "hover:shadow-green-500/20",
          text: "group-hover:text-green-400",
          glow: "group-hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]",
          gradient: "from-green-500/20 to-green-600/10"
        };
      case "yellow":
        return {
          border: "border-yellow-500/30 hover:border-yellow-500",
          shadow: "hover:shadow-yellow-500/20",
          text: "group-hover:text-yellow-400",
          glow: "group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]",
          gradient: "from-yellow-500/20 to-yellow-600/10"
        };
      case "purple":
        return {
          border: "border-purple-500/30 hover:border-purple-500",
          shadow: "hover:shadow-purple-500/20",
          text: "group-hover:text-purple-400",
          glow: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]",
          gradient: "from-purple-500/20 to-purple-600/10"
        };
      case "red":
        return {
          border: "border-red-500/30 hover:border-red-500",
          shadow: "hover:shadow-red-500/20",
          text: "group-hover:text-red-400",
          glow: "group-hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]",
          gradient: "from-red-500/20 to-red-600/10"
        };
      case "orange":
        return {
          border: "border-orange-500/30 hover:border-orange-500",
          shadow: "hover:shadow-orange-500/20",
          text: "group-hover:text-orange-400",
          glow: "group-hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]",
          gradient: "from-orange-500/20 to-orange-600/10"
        };
      default:
        return {
          border: "border-blue-500/30 hover:border-blue-500",
          shadow: "hover:shadow-blue-500/20",
          text: "group-hover:text-blue-400",
          glow: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
          gradient: "from-blue-500/20 to-blue-600/10"
        };
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-24 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-40 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[150px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-full border border-zinc-700 mb-6">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-zinc-300">Gamified Learning</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-red-700 to-red-400 bg-clip-text text-transparent">
              DevCompete
            </span>
            <span className="text-gray-700"> ¿</span> 
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const classes = getClasses(feature.color);
            return (
              <div
                key={index}
                className={`group relative bg-gradient-to-br from-zinc-900/50 to-zinc-950/80 backdrop-blur-sm p-8 rounded-2xl border-2 ${classes.border} ${classes.glow} transition-all duration-500 hover:scale-105 shadow-lg hover:-translate-y-2 overflow-hidden`}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${classes.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    <Icon className={`w-16 h-16 text-zinc-400 ${classes.text} transition-colors duration-300`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-2xl mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 leading-relaxed mb-4 text-base">
                    {feature.description}
                  </p>

                  {/* Stats badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <span className={`text-sm font-semibold text-zinc-400 ${classes.text} transition-colors duration-300`}>
                      {feature.stats}
                    </span>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
