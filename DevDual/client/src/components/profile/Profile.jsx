import { useState, useEffect } from "react";
import { FaUser, FaTrophy, FaTimes } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { BsFillPencilFill, BsCheck2, BsX } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import MatchAnalysis from "../../pages/History";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { serverURL } from "../../App";
import { toast } from "react-toastify";


function Profile() {
  const { userData } = useUser();
  const navigate = useNavigate();
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    fetchFollowRequests();
    fetchMatchHistory();
  }, []);

  const fetchMatchHistory = async () => {
    try {
      setLoadingMatches(true);
      const res = await axios.get(`${serverURL}/user/getmatchhistory`, { withCredentials: true });
      setMatchHistory(res.data || []);
    } catch (error) {
      console.error("Error fetching match history:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const fetchFollowRequests = async () => {
    try {
      setLoadingRequests(true);
      const [receivedRes, sentRes] = await Promise.all([
        axios.get(`${serverURL}/social/follow-requests/pending`, { withCredentials: true }),
        axios.get(`${serverURL}/social/follow-requests/sent`, { withCredentials: true })
      ]);
      setReceivedRequests(receivedRes.data.requests || []);
      setSentRequests(sentRes.data.requests || []);
    } catch (error) {
      console.error("Error fetching follow requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(
        `${serverURL}/social/follow-request/${requestId}/accept`,
        {},
        { withCredentials: true }
      );
      toast.success("Follow request accepted!");
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(
        `${serverURL}/social/follow-request/${requestId}/reject`,
        {},
        { withCredentials: true }
      );
      toast.success("Follow request rejected");
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await axios.delete(
        `${serverURL}/social/follow-request/${requestId}/cancel`,
        { withCredentials: true }
      );
      toast.success("Follow request cancelled");
      setSentRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      console.error("Cancel request error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel request");
    }
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

  const totalBattles = userData?.matches?.length || 0;
  // This logic would be more complex in a real app
  const wins = userData?.matches?.filter((m) => m.result === "Win").length || 0;
  const losses = totalBattles - wins;
  const winRate =
    totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(0) : 0;

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
        {/* Subtle grid lines */}
        <div className="fixed top-0 bottom-0 left-8 lg:left-16 w-[1px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10 pointer-events-none"></div>
        <div className="fixed top-0 bottom-0 right-8 lg:right-16 w-[1px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto pt-10 relative z-20">
          {/* --- Main Profile Card --- */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Section - Profile Info */}
              <div className="flex-1 bg-zinc-900/50 rounded-xl p-6 border border-zinc-700 flex flex-col justify-center items-center">
                <div
                  className="w-24 h-24 border-2 border-zinc-600 bg-zinc-800 rounded-full flex items-center justify-center mb-4 relative cursor-pointer hover:border-zinc-500 transition-colors group"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Click to Edit Profile"
                  data-tooltip-place="top"
                  onClick={() => navigate("/edit-profile")}
                >
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData?.name ? (
                    <span className="text-white text-3xl font-bold uppercase">
                      {userData.name.charAt(0)}
                    </span>
                  ) : (
                    <FaUser className="text-white text-3xl" />
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-zinc-700 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <BsFillPencilFill className="text-white text-xs" />
                  </div>
                </div>

                {/* Username & Description with Edit Icon */}
                <div className="bg-zinc-800/70 rounded-lg p-4 mb-3 border border-zinc-700 w-full hover:bg-zinc-800 transition-colors relative group">
                  <p className="text-lg font-semibold pr-6">
                    {userData?.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-zinc-300 pr-6">
                    {userData?.description || "No description provided"}
                  </p>
                  <BsFillPencilFill
                    className="text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors absolute top-4 right-4 group-hover:opacity-100 opacity-0 md:opacity-100"
                    onClick={() => navigate("/edit-profile")}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Edit Name/Description"
                  />
                </div>

                {/* Email */}
                <div className="bg-zinc-800/70 rounded-lg px-4 py-3 mb-4 border border-zinc-700 w-full">
                  <p className="text-sm text-zinc-300">
                    {userData?.email || "No email"}
                  </p>
                </div>

                {/* Join Date and Player ID */}
                <div className="space-y-1.5 text-sm text-zinc-400 text-center w-full">
                  <p>
                    <span className="font-medium text-zinc-300">Joined On:</span>{" "}
                    {formatDate(userData?.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-300">Player ID:</span>{" "}
                    <span className="font-mono text-blue-400 font-bold">
                      {userData?.playerId || "N/A"}
                    </span>
                  </p>
                </div>
                
                {/* Social Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link 
                    to={`/social/${userData?._id}/followers`}
                    className="bg-zinc-800/70 rounded-lg px-3 py-2 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 transition-all cursor-pointer"
                  >
                    <p className="text-2xl font-bold text-blue-400 text-center">
                      {userData?.followers?.length || 0}
                    </p>
                    <p className="text-xs text-zinc-400 text-center">Followers</p>
                  </Link>
                  <Link 
                    to={`/social/${userData?._id}/following`}
                    className="bg-zinc-800/70 rounded-lg px-3 py-2 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 transition-all cursor-pointer"
                  >
                    <p className="text-2xl font-bold text-green-400 text-center">
                      {userData?.following?.length || 0}
                    </p>
                    <p className="text-xs text-zinc-400 text-center">Following</p>
                  </Link>
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
                  <StatCard label="Rating" value={userData?.rating || 100} className="text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* --- Pending Follow Requests Section --- */}
          {(receivedRequests.length > 0 || sentRequests.length > 0) && (
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl mb-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Follow Requests</h2>
              
              {/* Received Requests */}
              {receivedRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-zinc-300">Received ({receivedRequests.length})</h3>
                  <div className="space-y-3">
                    {receivedRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700 flex items-center justify-between hover:bg-zinc-900 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700">
                            {request.sender.photoURL ? (
                              <img
                                src={request.sender.photoURL}
                                alt={request.sender.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {request.sender.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {request.sender.name}
                            </h4>
                            <p className="text-sm text-zinc-400">
                              @{request.sender.playerId}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-1"
                          >
                            <BsCheck2 className="text-lg" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-1"
                          >
                            <BsX className="text-lg" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sent Requests */}
              {sentRequests.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-zinc-300">Sent ({sentRequests.length})</h3>
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700 flex items-center justify-between hover:bg-zinc-900 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700">
                            {request.receiver.photoURL ? (
                              <img
                                src={request.receiver.photoURL}
                                alt={request.receiver.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {request.receiver.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {request.receiver.name}
                            </h4>
                            <p className="text-sm text-zinc-400">
                              @{request.receiver.playerId}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Pending...
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelRequest(request._id)}
                          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Match History Section --- */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-white">Match History</h2>
            <div className="space-y-4">
              {loadingMatches ? (
                <p className="text-zinc-400 text-center py-4">Loading matches...</p>
              ) : matchHistory.length > 0 ? (
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

      {/* --- Conditional Modal Render --- */}
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

// Helper function (needed by MatchHistoryItem)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default Profile;