import { useState } from "react";
import { socket } from "../socket";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { useBattle } from "../context/BattleContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { serverURL } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userData } = useUser();
  const { updateBattleData } = useBattle();

  const handleJoinRoom = async () => {
    // Trim and normalize room ID
    const normalizedRoomId = roomId.trim().toUpperCase();

    if (!normalizedRoomId) {
      toast.error("Please enter a room ID");
      return;
    }

    if (normalizedRoomId.length !== 8) {
      toast.error("Room ID must be 8 characters");
      return;
    }

    if (!userData?._id) {
      toast.error("Please log in first");
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting to join room: "${normalizedRoomId}"`);

      const { data } = await axios.post(
        `${serverURL}/rooms/join`,
        {
          roomId: normalizedRoomId,
          opponentId: userData._id,
        },
        { withCredentials: true }
      );

      console.log("Joined room data:", data);
      toast.success("Joined room successfully!");

      // Update battle context with room data
      updateBattleData({
        roomId: data.roomId,
        host: data.host,
        problems: data.problems,
        metadata: data.metadata,
        isHost: false,
        opponentJoined: true,
        opponentName: userData.name,
        opponentPhoto: userData.photoURL,
      });

      // Navigate to waiting window
      navigate("/waiting-window", {
        state: {
          roomId: data.roomId,
          problems: data.problems,
          metadata: data.metadata,
          host: data.host,
          isHost: false,
        },
      });
    } catch (error) {
      console.error("Error joining room:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to join room";

      // Display specific error messages
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    // Only allow alphanumeric characters, convert to uppercase
    const value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    setRoomId(value);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <div className="md:px-12 lg:px-20">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20 mt-10">
          <div className="max-w-md w-full">
            <div className="bg-zinc-900 rounded-2xl border-2 border-zinc-800 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⚔️</div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Join Battle Room
                </h1>
                <p className="text-zinc-400">
                  Enter the room ID to join the battle
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-300 mb-2 font-medium">
                    Room ID
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={handleInputChange}
                    placeholder="Enter 8-character room ID"
                    maxLength={8}
                    className="w-full px-4 py-3 bg-zinc-800 text-white border-2 border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-wider uppercase"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleJoinRoom();
                    }}
                  />
                  <p className="text-zinc-500 text-sm mt-2 text-center">
                    {roomId.length}/8 characters
                  </p>
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={loading || roomId.length !== 8}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Joining...
                    </span>
                  ) : (
                    "Join Room"
                  )}
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-all border border-zinc-700"
                >
                  Back to Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default JoinRoom;
