import { useState, useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { BsCheck2, BsX, BsTrash } from "react-icons/bs";

function NotificationsPage() {
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${serverURL}/social/follow-requests/pending`,
        { withCredentials: true }
      );
      setFollowRequests(res.data.requests || []);
    } catch (error) {
      console.error("Error fetching follow requests:", error);
      toast.error("Failed to load follow requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.put(
        `${serverURL}/social/follow-request/${requestId}/accept`,
        {},
        { withCredentials: true }
      );
      toast.success("Follow request accepted!");
      setFollowRequests(followRequests.filter((req) => req._id !== requestId));
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(
        `${serverURL}/social/follow-request/${requestId}/reject`,
        {},
        { withCredentials: true }
      );
      toast.success("Follow request rejected");
      setFollowRequests(followRequests.filter((req) => req._id !== requestId));
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const handleClearAll = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${serverURL}/notifications/clear/all`,
        { withCredentials: true }
      );
      toast.success("All notifications cleared");
      setFollowRequests([]);
      setShowClearModal(false);
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
      setShowClearModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white pt-20 px-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Follow Requests</h2>
              <button
                onClick={() => setShowClearModal(true)}
                disabled={loading || followRequests.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <BsTrash className="text-lg" />
                Clear All
              </button>
            </div>

            {loading ? (
              <div className="text-center text-zinc-400 py-8">Loading...</div>
            ) : followRequests.length === 0 ? (
              <div className="text-center text-zinc-400 py-8">
                No pending follow requests
              </div>
            ) : (
              <div className="space-y-4">
                {followRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700 flex items-center justify-between hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-700">
                        {request.sender.photoURL ? (
                          <img
                            src={request.sender.photoURL}
                            alt={request.sender.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                            {request.sender.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {request.sender.name}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          Player ID: {request.sender.playerId}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                      >
                        <BsCheck2 className="text-xl" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                      >
                        <BsX className="text-xl" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
            onClick={() => setShowClearModal(false)}
          />
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-3">Clear All Notifications?</h3>
              <p className="text-zinc-400 mb-6">
                Are you sure you want to clear all notifications? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <BsTrash />
                  {loading ? "Clearing..." : "Clear All"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}

export default NotificationsPage;
