import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { BsSendFill, BsArrowLeft } from "react-icons/bs";
import io from "socket.io-client";
import { useUser } from "../context/UserContext";

function MessagesPage() {
  const { userId: chatUserId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(serverURL.replace("/api", ""), {
      withCredentials: true,
    });

    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      if (userData?._id) {
        newSocket.emit("authenticate", { userId: userData._id });
      }
    });

    newSocket.on("private-message-received", (message) => {
      // Only add to conversation if it's from the current chat user
      if (message.sender._id === chatUserId) {
        setCurrentConversation((prev) => [...prev, message]);
      }
      // Refresh conversations list
      fetchConversations();
    });

    newSocket.on("private-message-sent", (message) => {
      // Message already added optimistically
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userData?._id, chatUserId]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (chatUserId) {
      fetchConversation(chatUserId);
    }
  }, [chatUserId]);

  // Auto-scroll when conversation loads or new messages arrive
  useEffect(() => {
    if (currentConversation.length > 0) {
      scrollToBottom();
    }
  }, [currentConversation.length]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${serverURL}/messages/conversations`, {
        withCredentials: true,
      });
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchConversation = async (otherUserId) => {
    try {
      setLoading(true);
      
      // Always fetch user info first to ensure chat header shows
      try {
        const userRes = await axios.get(`${serverURL}/user/${otherUserId}`, {
          withCredentials: true,
        });
        setCurrentChatUser(userRes.data);
      } catch (userError) {
        console.error("Error fetching user info:", userError);
        toast.error("Failed to load user information");
        setLoading(false);
        return;
      }
      
      // Fetch conversation messages
      const res = await axios.get(
        `${serverURL}/messages/conversation/${otherUserId}`,
        { withCredentials: true }
      );
      setCurrentConversation(res.data.messages || []);
      
      // Delete any message notifications from this sender (silently, no need to await)
      axios.delete(`${serverURL}/notifications/delete-by-sender`, {
        withCredentials: true,
        data: { senderId: otherUserId, type: 'message' }
      }).catch(err => console.error("Error deleting message notifications:", err));
      
      // Scroll to bottom after messages are loaded
      setTimeout(() => scrollToBottom(), 200);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !chatUserId) return;

    const messageContent = messageInput.trim();
    setMessageInput("");

    // Optimistically add message to UI
    const optimisticMessage = {
      _id: Date.now(),
      sender: { _id: userData._id, name: userData.name, photoURL: userData.photoURL },
      receiver: { _id: chatUserId },
      content: messageContent,
      createdAt: new Date().toISOString(),
    };
    setCurrentConversation((prev) => [...prev, optimisticMessage]);

    try {
      if (socket && socket.connected) {
        socket.emit("send-private-message", {
          receiverId: chatUserId,
          content: messageContent,
        });
      } else {
        // Fallback to HTTP if socket not connected
        await axios.post(
          `${serverURL}/messages/send`,
          { receiverId: chatUserId, content: messageContent },
          { withCredentials: true }
        );
        toast.success("Message sent!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      // Remove optimistic message on error
      setCurrentConversation((prev) =>
        prev.filter((msg) => msg._id !== optimisticMessage._id)
      );
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white pt-20 px-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-180px)] flex">
            
            {/* Conversations List */}
            <div className={`w-full md:w-1/3 border-r border-zinc-700 flex flex-col ${chatUserId ? 'hidden md:flex' : ''}`}>
              <div className="p-4 border-b border-zinc-700">
                <h2 className="text-xl font-bold">Messages</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.user._id}
                      onClick={() => navigate(`/messages/${conv.user._id}`)}
                      className={`p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer transition-colors ${
                        chatUserId === conv.user._id ? "bg-zinc-800" : ""
                      }`}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                          {conv.user.photoURL ? (
                            <img
                              src={conv.user.photoURL}
                              alt={conv.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                              {conv.user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-white truncate">
                              {conv.user.name}
                            </h3>
                            <span className="text-xs text-zinc-400">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400 truncate">
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="inline-block mt-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!chatUserId ? 'hidden md:flex' : ''}`}>
              {chatUserId && currentChatUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-zinc-700 flex items-center gap-3">
                    <button
                      onClick={() => navigate("/messages")}
                      className="md:hidden p-2 hover:bg-zinc-700 rounded-lg"
                    >
                      <BsArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
                      {currentChatUser.photoURL ? (
                        <img
                          src={currentChatUser.photoURL}
                          alt={currentChatUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {currentChatUser.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{currentChatUser.name}</h3>
                      <p className="text-xs text-zinc-400">
                        {currentChatUser.playerId}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                      <div className="text-center text-zinc-400">Loading...</div>
                    ) : currentConversation.length === 0 ? (
                      <div className="text-center text-zinc-400">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      currentConversation.map((msg, index) => {
                        const isMe = msg.sender._id === userData._id;
                        return (
                          <div
                            key={msg._id || index}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                                {msg.sender.photoURL ? (
                                  <img
                                    src={msg.sender.photoURL}
                                    alt={msg.sender.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                    {msg.sender.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <div
                                  className={`px-4 py-2 rounded-2xl ${
                                    isMe
                                      ? "bg-blue-600 text-white"
                                      : "bg-zinc-700 text-white"
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                </div>
                                <p className={`text-xs text-zinc-500 mt-1 ${isMe ? "text-right" : ""}`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <BsSendFill />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-400">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MessagesPage;
