import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaTrophy, FaTimes } from "react-icons/fa";
import { BsPersonAdd, BsChatDots } from "react-icons/bs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Tooltip } from "react-tooltip";
import MatchAnalysis from "./History";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { serverURL } from "../App";
import { toast } from "react-toastify";

function UserProfile() {
  const { userId } = useParams();
  const { userData: currentUser } = useUser();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [matchHistory, setMatchHistory] = useState([]);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Redirect if trying to view own profile
    if (currentUser?._id === userId) {
      navigate("/profile");
      return;
    }
    fetchUserProfile();
  }, [userId, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverURL}/user/${userId}`, {
        withCredentials: true,
      });
      setUserProfile(res.data);
      
      // Fetch match history for this user (public matches visible to all)
      try {
        const matchRes = await axios.get(`${serverURL}/user/getmatchhistory`, { withCredentials: true });
        setMatchHistory(matchRes.data || []);
      } catch (e) {
        console.error("Error fetching match history:", e);
      }
      
      // Check if following
      if (currentUser?.following) {
        setIsFollowing(currentUser.following.includes(userId));
      }
      
      // Check if can message (both follow each other OR have existing conversation)
      if (currentUser?.following && currentUser?.followers) {
        const bothFollow = currentUser.following.includes(userId) && 
                          currentUser.followers.includes(userId);
        
        // Check for existing conversation
        const conversationsRes = await axios.get(`${serverURL}/messages/conversations`, {
          withCredentials: true,
        });
        const hasConversation = conversationsRes.data.conversations.some(
          conv => conv.user._id === userId
        );
        
        setCanMessage(bothFollow || hasConversation);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowRequest = async () => {
    try {
      await axios.post(
        `${serverURL}/social/follow-request`,
        { receiverId: userId },
        { withCredentials: true }
      );
      toast.success("Follow request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(`${serverURL}/social/unfollow/${userId}`, {
        withCredentials: true,
      });
      toast.success("Unfollowed successfully");
      setIsFollowing(false);
      setCanMessage(false);
    } catch (error) {
      toast.error("Failed to unfollow");
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${userId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white flex items-center justify-center">
          <div className="text-xl text-zinc-400">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white flex items-center justify-center">
          <div className="text-xl text-zinc-400">User not found</div>
        </div>
        <Footer />
      </>
    );
  }

  const totalBattles = userProfile?.matches?.length || 0;
  const wins = userProfile?.matches?.filter((m) => m.result === "Win").length || 0;
  const losses = totalBattles - wins;
  const winRate = totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(0) : 0;

  return (
    <>
      <Navbar />

      <Tooltip
        id="my-tooltip"
        style={{
          backgroundColor: "#27272a",
          color: "#fff",
          borderRadius: "6px",
          padding: "6px 10px",
          fontSize: "0.85rem",
          border: "1px solid #3f3f46",
          zIndex: 9999,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white py-20 px-4 md:px-12 lg:px-20 relative overflow-visible">
        <div className="fixed top-0 bottom-0 left-8 lg:left-16 w-[1px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10 pointer-events-none"></div>
        <div className="fixed top-0 bottom-0 right-8 lg:right-16 w-[1px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto pt-10 relative z-20">
          {/* Action Buttons */}
          <div className="mb-4 flex gap-3 justify-end">
            {isFollowing ? (
              <button
                onClick={handleUnfollow}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                Unfollow
              </button>
            ) : (
              <button
                onClick={handleSendFollowRequest}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <BsPersonAdd />
                Send Follow Request
              </button>
            )}
            
            {canMessage && (
              <button
                onClick={handleMessage}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <BsChatDots />
                Message
              </button>
            )}
          </div>

          {/* Main Profile Card */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Section - Profile Info */}
              <div className="flex-1 bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 flex flex-col justify-center items-center">
                <div className="w-24 h-24 border-2 border-zinc-600 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userProfile?.name ? (
                    <span className="text-white text-3xl font-bold uppercase">
                      {userProfile.name.charAt(0)}
                    </span>
                  ) : (
                    <FaUser className="text-white text-3xl" />
                  )}
                </div>

                <div className="bg-zinc-800/70 rounded-lg p-4 mb-3 border border-zinc-700 w-full">
                  <p className="text-lg font-semibold">
                    {userProfile?.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-zinc-300">
                    {userProfile?.description || "No description provided"}
                  </p>
                </div>

                <div className="space-y-1.5 text-sm text-zinc-400 text-center w-full">
                  <p>
                    <span className="font-medium text-zinc-300">Joined On:</span>{" "}
                    {formatDate(userProfile?.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-300">Player ID:</span>{" "}
                    <span className="font-mono text-blue-400 font-bold">
                      {userProfile?.playerId || "N/A"}
                    </span>
                  </p>
                </div>

                {/* Social Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                  <div className="bg-zinc-800/70 rounded-lg px-3 py-2 border border-zinc-700">
                    <p className="text-2xl font-bold text-blue-400 text-center">
                      {userProfile?.followers?.length || 0}
                    </p>
                    <p className="text-xs text-zinc-400 text-center">Followers</p>
                  </div>
                  <div className="bg-zinc-800/70 rounded-lg px-3 py-2 border border-zinc-700">
                    <p className="text-2xl font-bold text-green-400 text-center">
                      {userProfile?.following?.length || 0}
                    </p>
                    <p className="text-xs text-zinc-400 text-center">Following</p>
                  </div>
                </div>
              </div>

              {/* Right Section - Stats */}
              <div className="flex-1 bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 grid grid-rows-3 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Wins" value={wins} className="text-green-500" />
                  <StatCard label="Losses" value={losses} className="text-red-500" />
                </div>
                <StatCard label="Total Battles" value={totalBattles} />
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Win Rate" value={`${winRate}%`} className="text-blue-500" />
                  <StatCard label="Rating" value={userProfile?.rating || 100} className="text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Match History Section */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-white">Match History</h2>
            <div className="space-y-4">
              {matchHistory.length > 0 ? (
                matchHistory.map((match) => (
                  <MatchHistoryItem
                    key={match.matchId}
                    match={match}
                    onView={() => setSelectedMatchId(match.matchId)}
                  />
                ))
              ) : (
                <p className="text-zinc-400 text-center py-4">
                  No matches played yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {selectedMatchId && (
        <MatchAnalysis
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </>
  );
}

// Helper component for Stats
const StatCard = ({ label, value, className = "text-white" }) => (
  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 text-center">
    <p className="text-sm text-zinc-400 mb-1">{label}</p>
    <p className={`text-2xl font-semibold ${className}`}>{value}</p>
  </div>
);

// Helper component for Match History List
const MatchHistoryItem = ({ match, onView }) => (
  <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl p-4 shadow-lg transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-800">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex-1 text-center md:text-left">
        <p className="text-sm text-zinc-400">vs</p>
        <p className="text-lg font-semibold text-white">{match.opponent}</p>
      </div>
      <div
        className={`flex-1 font-semibold text-xl flex items-center justify-center gap-2 ${
          match.result === "Win" ? "text-green-500" : "text-red-500"
        }`}
      >
        {match.result === "Win" ? <FaTrophy /> : <FaTimes />}
        {match.result}
      </div>
      <div className="flex-1 text-center md:text-right">
        <p className="font-mono text-zinc-300">{match.score}</p>
        <p className="text-sm text-zinc-400">{formatDate(match.date)}</p>
      </div>
      <div className="w-full md:w-auto">
        <button
          onClick={onView}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md"
        >
          View Analysis
        </button>
      </div>
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default UserProfile;
