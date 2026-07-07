import { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { socket } from "../socket";
import { useUser } from "../context/UserContext";

function ChatBot({ roomId }) {
  const { userData } = useUser();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState(() => {
    // Load saved messages for this room
    const saved = localStorage.getItem(`chat_${roomId}`);
    return (
      JSON.parse(saved) || [
        {
          sender: "system",
          name: "System",
          text: "⚠️ Please keep the chat clean and respectful. Avoid using abusive language.",
        },
      ]
    );
  });
  const [input, setInput] = useState("");
  const maxLength = 500;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (roomId) {
      localStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
    }
  }, [messages, roomId]);

  // Clear chat history when room changes
  useEffect(() => {
    return () => {
      if (roomId) {
        // Clean up old chat when leaving room (optional - keep for history)
        // localStorage.removeItem(`chat_${roomId}`);
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !userData?._id) return;

    // Listen for incoming messages (no need to join-room again as user is already in room)
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleMessageError = (error) => {
      console.error("[Chat Error]:", error);
    };

    socket.on("receive-message", handleMessage);
    socket.on("message-error", handleMessageError);

    return () => {
      socket.off("receive-message", handleMessage);
      socket.off("message-error", handleMessageError);
    };
  }, [roomId, userData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const trimmedText = input.trim();
    if (trimmedText.length > maxLength) {
      return; // Prevent sending if over limit
    }

    const newMessage = {
      roomId,
      sender: userData._id,
      name: userData.name,
      text: trimmedText,
    };

    socket.emit("send-message", newMessage);
    setInput("");
  };

  return (
    <div className="w-[380px] h-[480px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-blue-700 text-white rounded-t-xl px-4 py-2 font-bold text-lg">
        Chat Room
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.sender === userData._id ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium ${
                  msg.sender === "system"
                    ? "text-yellow-400"
                    : msg.sender === userData._id
                    ? "text-blue-400"
                    : "text-zinc-400"
                }`}
              >
                {msg.name || msg.sender}
              </span>
              {msg.timestamp && (
                <span className="text-xs text-zinc-500">
                  {formatTime(msg.timestamp)}
                </span>
              )}
            </div>
            <div
              className={`px-3 py-2 rounded-lg max-w-[80%] text-sm break-words ${
                msg.sender === "system"
                  ? "bg-zinc-800 text-yellow-300 italic"
                  : msg.sender === userData._id
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-zinc-700">
        <div className="flex">
          <input
            className="flex-1 px-3 py-2 bg-zinc-800 text-white rounded-bl-xl outline-none"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            maxLength={maxLength}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-br-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaPaperPlane />
          </button>
        </div>
        {input.length > 0 && (
          <div className="text-xs text-zinc-500 px-3 pb-1 text-right">
            {input.length}/{maxLength}
          </div>
        )}
      </form>
    </div>
  );
}

export default ChatBot;
