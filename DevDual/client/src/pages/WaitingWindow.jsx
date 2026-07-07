import { useState, useEffect, useRef } from "react";
import { FaCopy, FaCheck, FaUser } from "react-icons/fa";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { useBattle } from "../context/BattleContext";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import ChatBot from "../components/ChatBot";
import { serverURL } from "../App";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import { socket } from "../socket";

// New sub-component for handling profile images
const PlayerImage = ({ photoURL, name }) => {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || "Player"}
        className="w-full h-full rounded-full object-cover"
      />
    );
  }
  if (name) {
    return (
      <span className="text-white text-3xl font-bold uppercase">
        {name.charAt(0)}
      </span>
    );
  }
  // Default "dummy" icon
  return <FaUser className="text-white text-3xl" />;
};

function WaitingWindow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { battleData, updateBattleData, resetBattle } = useBattle();
  const { userData } = useUser();
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  // Initialize opponentJoined from battleData context (important for opponent who just joined)
  const [opponentJoined, setOpponentJoined] = useState(battleData.opponentJoined || false);
  
  // Use ref to track if match has started (prevents emitting leave-room on navigation to problem)
  const matchStartedRef = useRef(false);

  // Sync local state with battleData context
  useEffect(() => {
    if (battleData.opponentJoined !== undefined) {
      setOpponentJoined(battleData.opponentJoined);
    }
  }, [battleData.opponentJoined]);

  const roomId = (location.state?.roomId || battleData.roomId)
    ?.trim()
    .toUpperCase();

  // Initialize battle data from location.state - run once
  useEffect(() => {
    if (location.state?.problems && location.state?.roomId) {
      const normalizedRoomId = location.state.roomId.trim().toUpperCase();
      const isHost = !!location.state.isHost;
      
      // Ensure host's photoURL is also passed if available when initializing for a guest
      const hostData = location.state.host || null;
      if (hostData && !hostData.photoURL && location.state.hostPhotoURL) {
          hostData.photoURL = location.state.hostPhotoURL;
      }

      // Don't reset opponent data if current user is the opponent (they just joined)
      const updateData = {
        problems: location.state.problems,
        metadata: location.state.metadata,
        roomId: normalizedRoomId,
        isHost: isHost,
        host: hostData,
      };

      // Only reset opponent data if user is the host
      // If user is opponent, keep the data from join (opponentJoined should be true)
      if (isHost) {
        updateData.opponentJoined = false;
        updateData.opponentName = null;
        updateData.opponentPhoto = null;
      }

      updateBattleData(updateData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]); // Dependency on location.state is correct here

  // Setup socket listeners
  useEffect(() => {
    if (!roomId || !userData?._id) return;

    console.log(`[WaitingWindow] Joining room: "${roomId}" as ${userData.name}`);

    // Ensure socket is connected before joining room
    const joinRoom = () => {
      if (!socket.connected) {
        console.log(`[WaitingWindow] Socket not connected, connecting...`);
        socket.connect();
      }

      socket.emit("join-room", {
        roomId,
        userId: userData._id,
        name: userData.name,
        photoURL: userData.photoURL,
      });
      console.log(`[WaitingWindow] Join room event emitted for ${roomId}`);
    };

    // Join immediately if already connected
    if (socket.connected) {
      joinRoom();
    } else {
      // Wait for connection, then join
      socket.on("connect", joinRoom);
    }

    const handleRoomError = (error) => {
      console.error("[WaitingWindow] Room error:", error);
      toast.error(error.message || "Failed to join room");
      // Navigate back to battle page on error
      setTimeout(() => {
        navigate("/battle");
      }, 2000);
    };

    const handleOpponentJoined = ({ userId, name, photoURL }) => {
      console.log("Opponent joined:", name || userId, photoURL);
      toast.success(`${name || "Opponent"} joined the room!`);
      setOpponentJoined(true);

      updateBattleData({
        opponentJoined: true,
        opponentName: name || "Opponent",
        opponentPhoto: photoURL || null, // Ensure photoURL is correctly stored
      });
    };

    const handleMatchStarted = ({ startTime, matchId, metadata: serverMetadata }) => {
      // Prevent duplicate handling if already started
      if (matchStartedRef.current) {
        console.log("Match already started, ignoring duplicate event");
        return;
      }
      
      console.log("Match started. StartTime:", startTime, "MatchID:", matchId, "Metadata:", serverMetadata);
      
      matchStartedRef.current = true;
      toast.success("Battle is started!");

      // Use server-provided metadata so BOTH players get the same duration.
      // Fall back to local state only if the server didn't send metadata.
      const resolvedMetadata = serverMetadata
        || battleData.metadata
        || location.state?.metadata;

      updateBattleData({
        startTime: Number(startTime) || Date.now(),
        matchId: matchId || null,
        // Overwrite metadata with server's authoritative value
        ...(resolvedMetadata ? { metadata: resolvedMetadata } : {}),
      });

      setTimeout(() => {
        const problems = battleData.problems || location.state?.problems;
        if (problems && problems.length > 0) {
          const firstProblemId = problems[0]._id || problems[0].id;
          navigate(`/problem/${firstProblemId}`);
        } else {
          toast.error("No problems available");
        }
      }, 500);
    };

    const handleOpponentLeft = ({ userId }) => {
      console.log("Opponent left the room:", userId);
      toast.warning("Opponent has left the room");
      setOpponentJoined(false);

      updateBattleData({
        opponentJoined: false,
        opponentName: null,
        opponentPhoto: null,
      });
    };

    const handleOpponentDisconnected = ({ userId }) => {
      console.log("Opponent disconnected:", userId);
      toast.error("Opponent disconnected from the room");
      setOpponentJoined(false);

      updateBattleData({
        opponentJoined: false,
        opponentName: null,
        opponentPhoto: null,
      });
    };

    const handleRoomCancelled = () => {
      toast.error("Host has cancelled the room");
      resetBattle();
      navigate("/battle");
    };

    // Handle browser tab closing or page reload
    const handleBeforeUnload = (e) => {
      socket.emit("leave-room", { roomId, userId: userData._id });
    };

    socket.on("opponent-joined", handleOpponentJoined);
    socket.on("match-started", handleMatchStarted);
    socket.on("opponent-left", handleOpponentLeft);
    socket.on("opponent-disconnected", handleOpponentDisconnected);
    socket.on("room-cancelled", handleRoomCancelled);
    socket.on("room-error", handleRoomError);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up socket listeners
      socket.off("connect", joinRoom);
      socket.off("opponent-joined", handleOpponentJoined);
      socket.off("match-started", handleMatchStarted);
      socket.off("opponent-left", handleOpponentLeft);
      socket.off("opponent-disconnected", handleOpponentDisconnected);
      socket.off("room-cancelled", handleRoomCancelled);
      socket.off("room-error", handleRoomError);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // IMPORTANT: Only emit leave-room if match hasn't started
      // If match has started, players are moving to problem page (not actually leaving)
      if (roomId && userData?._id && !matchStartedRef.current) {
        console.log(`Cleanup: Leaving room ${roomId} (match not started)`);
        socket.emit("leave-room", { roomId, userId: userData._id });
      } else if (matchStartedRef.current) {
        console.log(`Cleanup: Not leaving room ${roomId} (match has started)`);
      }
    };
  }, [
    roomId,
    userData,
    battleData.problems,
    location.state,
    navigate,
    updateBattleData,
    resetBattle,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      toast.success("Room ID copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCancelRoom = async () => {
    try {
      // Call backend API to delete room from database
      // The API will handle broadcasting the 'room-cancelled' socket event
      await axios.delete(`${serverURL}/rooms/cancel`, {
        data: { roomId, userId: userData._id },
        withCredentials: true,
      });

      toast.success("Room cancelled successfully");
      resetBattle();
      setShowCancelModal(false);
      navigate("/battle");
    } catch (error) {
      console.error("Cancel Room Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to cancel room"
      );
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId, userId: userData._id });

    toast.info("You left the room");
    resetBattle();
    navigate("/battle");
  };

  const handleStartBattle = () => {
    const problems = battleData.problems || location.state?.problems;
    if (!problems || problems.length === 0) {
      toast.error("No problems available for this battle");
      return;
    }

    if (!opponentJoined) {
      toast.error("Wait for opponent to join first");
      return;
    }

    console.log(`Starting battle in room: "${roomId}"`);
    // Include metadata so the server can validate and broadcast the start event
    const metadata = battleData.metadata || location.state?.metadata || {};
    socket.emit("start-match", { roomId, metadata });

    // Let the server emit 'match-started' which the client listens for and
    // navigates when received. We still show a toast here for immediate feedback.
    toast.success("Battle starting!");
  };

  if (!roomId) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 rounded-2xl p-8 max-w-md w-full border border-zinc-700 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-4">Error</h3>
          <p className="text-zinc-300 mb-6">
            No room ID found. Please create or join a room.
          </p>
          <button
            onClick={() => navigate("/battle")}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Back to Battle Menu
          </button>
        </div>
      </div>
    );
  }

  // Define player data for clarity in render
  // If current user is host, their photo is hostPhoto, opponent's is battleData.opponentPhoto
  // If current user is opponent, their photo is opponentPhoto, host's is battleData.host?.photoURL
  const isCurrentUserHost = battleData.isHost || location.state?.isHost;

  const hostPhoto = isCurrentUserHost
    ? userData.photoURL
    : battleData.host?.photoURL;
  const hostName = isCurrentUserHost
    ? userData.name
    : battleData.host?.name || "Host";

  const opponentPhoto = !isCurrentUserHost
    ? userData.photoURL
    : battleData.opponentPhoto; 
  const opponentName = !isCurrentUserHost
    ? userData.name
    : battleData.opponentName; 

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 rounded-2xl p-8 max-w-2xl w-full border border-zinc-700 shadow-2xl relative">
          <div className="text-center">
            <Tooltip id="copyTooltip" place="bottom" />
            <h3 className="text-3xl font-bold text-white">
              Waiting for Opponent
            </h3>
            <p className="text-zinc-400 mt-2">
              Share the room ID with your opponent to start the battle.
            </p>
          </div>

          <div className="mt-6 p-4 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-between flex-wrap gap-3">
            <span className="text-2xl font-mono text-blue-400">{roomId}</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {copied ? (
                <>
                  <FaCheck /> Copied
                </>
              ) : (
                <>
                  <FaCopy /> Copy
                </>
              )}
            </button>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-6 justify-center items-center">
            {/* Host Card */}
            <div className="flex-1 min-w-[180px] bg-zinc-800 border border-blue-500 rounded-xl p-6 flex flex-col items-center shadow-md">
              <div className="w-20 h-20 rounded-full bg-zinc-700 border-2 border-blue-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
                <PlayerImage photoURL={hostPhoto} name={hostName} />
              </div>
              <div className="text-lg font-semibold text-blue-300">
                Host {isCurrentUserHost ? "(You)" : ""}
              </div>
              <div className="text-zinc-400 text-sm mt-1">
                {hostName}
              </div>
            </div>

            {/* Opponent Card */}
            <div className="flex-1 min-w-[180px] bg-zinc-800 border border-orange-500 rounded-xl p-6 flex flex-col items-center shadow-md">
              <div className="w-20 h-20 rounded-full bg-zinc-700 border-2 border-orange-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
                <PlayerImage photoURL={opponentPhoto} name={opponentName} />
              </div>
              <div className="text-lg font-semibold text-orange-300">
                Opponent {!isCurrentUserHost ? "(You)" : ""}
              </div>
              <div className="text-zinc-400 text-sm mt-1">
                {opponentJoined
                  ? `${opponentName} ✅`
                  : !isCurrentUserHost
                  ? userData.name // If current user is opponent, show their name as opponent
                  : "Waiting to join..."}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            {/* Show chat when opponent has joined OR when current user is the opponent */}
            {(opponentJoined || (battleData.opponentJoined && !isCurrentUserHost)) ? (
              <button
                onClick={() => setShowChat((p) => !p)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                data-tooltip-id="copyTooltip"
                data-tooltip-content={showChat ? "Close Chat" : "Open Chat"}
              >
                <IoChatbubbleEllipses className="text-xl" />
                Chat
              </button>
            ) : (
              <div></div>
            )}

            {isCurrentUserHost ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartBattle}
                  disabled={!opponentJoined}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Battle
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Cancel Room
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  disabled
                  className="px-5 py-2 bg-zinc-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
                >
                  Waiting for Host...
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Leave Room
                </button>
              </div>
            )}
          </div>

          <p className="text-zinc-500 text-sm mt-4 text-center">
            {isCurrentUserHost
              ? "Click 'Start Battle' when your opponent joins."
              : "Wait for the host to start the battle."}
          </p>
        </div>

        {showCancelModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full border border-zinc-700 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Cancel Room?
              </h3>
              <p className="text-zinc-300 mb-6">
                Are you sure you want to cancel this room? The room will be
                deleted and you'll return to the battle selection page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium"
                >
                  Keep Waiting
                </button>
                <button
                  onClick={handleCancelRoom}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Cancel Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showChat && (
        <div className="fixed bottom-6 right-6 z-[1000]">
          <ChatBot roomId={roomId} />
        </div>
      )}
    </>
  );
}

export default WaitingWindow;