import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { BsPersonAdd, BsPersonDash, BsChatDots } from "react-icons/bs";
import { useUser } from "../context/UserContext";

function SocialListPage() {
  const { userId, type } = useParams(); // type: 'followers' or 'following'
  const navigate = useNavigate();
  const { userData } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = type === "followers" ? "followers" : "following";
      const res = await axios.get(`${serverURL}/social/${endpoint}/${userId}`);
      setUsers(res.data[endpoint] || []);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast.error(`Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      await axios.delete(`${serverURL}/social/unfollow/${targetUserId}`, {
        withCredentials: true,
      });
      toast.success("Unfollowed successfully");
      setUsers(users.filter((u) => u._id !== targetUserId));
    } catch (error) {
      toast.error("Failed to unfollow");
    }
  };

  const handleSendFollowRequest = async (targetUserId) => {
    try {
      await axios.post(
        `${serverURL}/social/follow-request`,
        { receiverId: targetUserId },
        { withCredentials: true }
      );
      toast.success("Follow request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  const handleMessage = (targetUserId) => {
    navigate(`/messages/${targetUserId}`);
  };

  const isOwnProfile = userData?._id === userId;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white pt-20 px-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 capitalize">
              {type}
            </h2>

            {loading ? (
              <div className="text-center text-zinc-400 py-8">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-zinc-400 py-8">
                No {type} yet
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => {
                  const isFollowing = userData?.following?.includes(user._id);
                  const canMessage =
                    isFollowing && userData?.followers?.includes(user._id);

                  return (
                    <div
                      key={user._id}
                      className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700 flex items-center justify-between hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-700">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.name}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            Player ID: {user.playerId}
                          </p>
                          <p className="text-sm text-zinc-400">
                            Rating: {user.rating}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isOwnProfile && type === "following" && (
                          <button
                            onClick={() => handleUnfollow(user._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            <BsPersonDash />
                            Unfollow
                          </button>
                        )}

                        {isOwnProfile &&
                          type === "followers" &&
                          !isFollowing && (
                            <button
                              onClick={() =>
                                handleSendFollowRequest(user._id)
                              }
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                              <BsPersonAdd />
                              Follow Back
                            </button>
                          )}

                        {canMessage && (
                          <button
                            onClick={() => handleMessage(user._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            <BsChatDots />
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SocialListPage;
