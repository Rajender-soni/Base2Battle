import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { serverURL } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function SearchUsers() {
  const [playerId, setPlayerId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { userData } = useUser();

  const handleSearch = async () => {
    if (!playerId.trim()) {
      toast.error("Please enter a Player ID");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${serverURL}/social/search/${playerId.trim()}`,
        { withCredentials: true }
      );
      setSearchResult(res.data.user);
      setShowModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateAndClose = (path) => {
    setShowModal(false);
    setPlayerId("");
    setSearchResult(null);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSendFollowRequest = async () => {
    if (!searchResult?._id) {
      toast.error("Invalid user data");
      return;
    }
    
    if (searchResult._id === userData?._id) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    try {
      await axios.post(
        `${serverURL}/social/follow-request`,
        { receiverId: searchResult._id },
        { withCredentials: true }
      );
      toast.success("Follow request sent!");
      setShowModal(false);
      setPlayerId("");
      setSearchResult(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Player ID"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="px-4 py-2 pr-10 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500 w-56"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <FaSearch />
          </button>
        </div>
      </div>

      {showModal && searchResult && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-8 z-10 min-w-[400px]">
            <h2 className="text-xl font-bold mb-6 text-white">User Found</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-700">
                {searchResult.photoURL ? (
                  <img
                    src={searchResult.photoURL}
                    alt={searchResult.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                    {searchResult.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {searchResult.name}
                </h3>
                <p className="text-sm text-zinc-400">
                  Player ID: {searchResult.playerId}
                </p>
                <p className="text-sm text-zinc-400">
                  Rating: {searchResult.rating}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {searchResult._id !== userData?._id && (
                <>
                  <button
                    onClick={handleSendFollowRequest}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                  >
                    Send Follow Request
                  </button>
                  <button
                    onClick={() => handleNavigateAndClose(`/user/${searchResult._id}`)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => handleNavigateAndClose(`/messages/${searchResult._id}`)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                  >
                    Whisper
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowModal(false);
                  setPlayerId("");
                  setSearchResult(null);
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchUsers;
