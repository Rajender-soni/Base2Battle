import { Tooltip } from "react-tooltip";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { serverURL } from "../App";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaMedal,
  FaGem,
  FaTrophy,
  FaCrown,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
} from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { useUser } from "../context/UserContext";

function LeaderBoard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const { userData } = useUser();
  const currentUserId = userData?._id;
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const fetchLeaderBoard = async () => {
      try {
        const response = await fetch(`${serverURL}/user/getleaderboard`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderBoard();
  }, []);

  // Pagination
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = leaderboardData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(leaderboardData.length / usersPerPage);

  const userRank =
    currentUserId && leaderboardData.length > 0
      ? leaderboardData.findIndex((user) => user._id === currentUserId) + 1
      : null;

  const getTier = (rating) => {
    if (rating == null || typeof rating !== "number")
      return { name: "Unrated", icon: FaMedal, color: "text-zinc-400" };
    if (rating <= 200)
      return { name: "Bronze", icon: FaMedal, color: "text-amber-500" };
    if (rating <= 400)
      return { name: "Silver", icon: FaMedal, color: "text-slate-300" };
    if (rating <= 800)
      return { name: "Gold", icon: FaMedal, color: "text-yellow-400" };
    if (rating <= 1300)
      return { name: "Platinum", icon: FaGem, color: "text-sky-400" };
    if (rating <= 2000)
      return { name: "Diamond", icon: FaGem, color: "text-indigo-400" };
    if (rating <= 2900)
      return { name: "Champion", icon: FaTrophy, color: "text-rose-400" };
    return { name: "Arceus", icon: FaCrown, color: "text-red-800" };
  };

  const tiers = [
    {
      name: "Bronze",
      range: "≤ 200",
      color: "text-amber-500",
      icon: FaMedal,
      quote: "Every master was once a beginner.",
    },
    {
      name: "Silver",
      range: "201 – 400",
      color: "text-slate-300",
      icon: FaMedal,
      quote: "Consistency turns effort into excellence.",
    },
    {
      name: "Gold",
      range: "401 – 800",
      color: "text-yellow-400",
      icon: FaMedal,
      quote: "Shine brighter with every challenge.",
    },
    {
      name: "Platinum",
      range: "801 – 1300",
      color: "text-sky-400",
      icon: FaGem,
      quote: "Precision, patience, and persistence.",
    },
    {
      name: "Diamond",
      range: "1301 – 2000",
      color: "text-indigo-400",
      icon: FaGem,
      quote: "Pressure creates diamonds.",
    },
    {
      name: "Champion",
      range: "2001 – 2900",
      color: "text-rose-400",
      icon: FaTrophy,
      quote: "Winners train, losers complain.",
    },
    {
      name: "Arceus",
      range: "2901+",
      color: "text-red-800",
      icon: FaCrown,
      quote: "Transcend limits. Be legendary.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-zinc-900/60 to-zinc-950"></div>

        {/* Rating Tiers Section */}
        <div className="z-10 text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Rating Tiers</h2>
          <p className="text-zinc-400 text-sm mb-6">
            See where you stand in rating ranges for each tier.
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {tiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <div
                  key={i}
                  className="w-[140px] sm:w-[160px] bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center hover:border-blue-500/40 transition-all relative"
                >
                  <div
                    data-tooltip-id={`tier-${tier.name}`}
                    data-tooltip-content={tier.quote}
                    data-tooltip-place="bottom"
                    className="flex justify-center mb-2"
                  >
                    <Icon className={`${tier.color} w-6 h-6 cursor-pointer`} />
                  </div>
                  <Tooltip
                    id={`tier-${tier.name}`}
                    className="!bg-zinc-900/95 !text-white !text-sm !border !border-blue-500/30 !backdrop-blur-md !rounded-xl !p-3 max-w-[200px]"
                    style={{
                      boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                    }}
                  />
                  <p className={`font-semibold ${tier.color}`}>{tier.name}</p>
                  <p className="text-zinc-400 text-xs">{tier.range}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="w-full max-w-3xl z-10 mt-6">
          {leaderboardData.length === 0 ? (
            <p className="text-zinc-400 text-center">No users found.</p>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-2 mb-3 text-zinc-400 text-sm font-semibold uppercase border-b border-zinc-800">
                <div className="flex items-center gap-4">
                  <span className="w-6 text-right">Rank</span>
                  <span className="w-12"></span>
                  <span>Name</span>
                </div>
                <span>Rating</span>
              </div>

              {/* Player Rows */}
              {currentUsers.map((user, index) => {
                const tier = getTier(user.rating);
                const Icon = tier.icon;
                const isYou = user._id === currentUserId;
                return (
                  <div
                    key={user._id || index}
                    className={`flex justify-between items-center bg-zinc-900/70 border backdrop-blur-md rounded-2xl p-4 mb-3 shadow-md transition-all ${
                      isYou
                        ? "border-blue-500/70 bg-blue-500/10"
                        : "border-zinc-800 hover:border-blue-600/40"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-blue-500 font-bold text-lg w-6 text-right">
                        {index + 1 + (currentPage - 1) * usersPerPage}.
                      </div>
                      
                      {/* Profile Picture with Hover Actions */}
                      {!isYou ? (
                        <div className="relative group/avatar">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border border-zinc-700 cursor-pointer transition-all group-hover/avatar:border-blue-500"
                            />
                          ) : (
                            <FaUserCircle className="w-12 h-12 text-zinc-700 cursor-pointer transition-all group-hover/avatar:text-blue-500" />
                          )}
                          
                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black/80 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleNavigate(`/user/${user._id}`)}
                              className="w-5 h-5 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              title="Inspect Profile"
                            >
                              <FaEye className="text-white text-xs" />
                            </button>
                            <button
                              onClick={() => handleNavigate(`/messages/${user._id}`)}
                              className="w-5 h-5 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              title="Send Message"
                            >
                              <BsChatDots className="text-white text-[10px]" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                            />
                          ) : (
                            <FaUserCircle className="w-12 h-12 text-zinc-700" />
                          )}
                        </>
                      )}
                      
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {user.name}
                          {isYou && (
                            <span className="text-xs bg-blue-600/40 px-2 py-0.5 rounded-md text-blue-300 font-medium">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Rank #{index + 1 + (currentPage - 1) * usersPerPage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-blue-400 font-semibold text-lg">
                          {user.rating ?? "—"}
                        </span>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
                          <Icon className={`${tier.color} w-4 h-4`} />
                          <span className={`font-medium ${tier.color}`}>
                            {tier.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-8 z-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                currentPage === 1
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
            >
              <FaArrowLeft /> Prev
            </button>

            <span className="text-zinc-400">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                currentPage === totalPages
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
            >
              Next <FaArrowRight />
            </button>
          </div>
        )}

        {/* User Rank */}
        <div className="mt-6 text-center z-10">
          {userRank ? (
            <h2 className="text-lg text-zinc-400">
              Your Rank:{" "}
              <span className="text-blue-400 font-semibold">#{userRank}</span>
            </h2>
          ) : (
            <h2 className="text-lg text-zinc-500">You’re not ranked yet.</h2>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LeaderBoard;
