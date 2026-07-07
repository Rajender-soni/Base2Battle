import { useState, useEffect } from "react";
import { BsBellFill, BsCheck2, BsX, BsTrash } from "react-icons/bs";
import axios from "axios";
import { serverURL } from "../App";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverURL}/notifications`, {
        withCredentials: true,
      });
      setNotifications(res.data.notifications || []);
      
      const unread = res.data.notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${serverURL}/notifications/unread-count`, {
        withCredentials: true,
      });
      setUnreadCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${serverURL}/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        `${serverURL}/notifications/read-all`,
        {},
        { withCredentials: true }
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(
        `${serverURL}/notifications/clear/all`,
        { withCredentials: true }
      );
      
      setNotifications([]);
      setUnreadCount(0);
      setShowClearModal(false);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      toast.error("Failed to clear notifications");
      setShowClearModal(false);
    }
  };

  const handleAcceptFollowRequest = async (e, notificationId, senderId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Find the follow request ID from the notification
      const res = await axios.get(
        `${serverURL}/social/follow-requests/pending`,
        { withCredentials: true }
      );
      
      const followRequest = res.data.requests.find(
        req => req.sender._id === senderId
      );
      
      if (!followRequest) {
        toast.error("Follow request not found");
        return;
      }
      
      await axios.put(
        `${serverURL}/social/follow-request/${followRequest._id}/accept`,
        {},
        { withCredentials: true }
      );
      
      toast.success("Follow request accepted!");
      
      // Delete the notification from database
      await axios.delete(
        `${serverURL}/notifications/${notificationId}`,
        { withCredentials: true }
      );
      
      // Remove notification from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Refresh notifications list after a short delay
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
    } catch (error) {
      console.error("Error accepting follow request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectFollowRequest = async (e, notificationId, senderId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await axios.get(
        `${serverURL}/social/follow-requests/pending`,
        { withCredentials: true }
      );
      
      const followRequest = res.data.requests.find(
        req => req.sender._id === senderId
      );
      
      if (!followRequest) {
        toast.error("Follow request not found");
        return;
      }
      
      await axios.put(
        `${serverURL}/social/follow-request/${followRequest._id}/reject`,
        {},
        { withCredentials: true }
      );
      
      toast.success("Follow request rejected");
      
      // Delete the notification from database
      await axios.delete(
        `${serverURL}/notifications/${notificationId}`,
        { withCredentials: true }
      );
      
      // Remove notification from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Refresh notifications list after a short delay
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
    } catch (error) {
      console.error("Error rejecting follow request:", error);
      toast.error("Failed to reject request");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
      >
        <BsBellFill className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <BsTrash className="text-xs" />
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 text-center text-zinc-400">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-zinc-800 hover:bg-zinc-800 transition-colors ${
                      notification.type !== 'follow_request' ? 'cursor-pointer' : ''
                    } ${
                      !notification.read ? "bg-zinc-800/50" : ""
                    }`}
                    onClick={() => {
                      if (notification.type !== 'follow_request') {
                        if (!notification.read) {
                          handleMarkAsRead(notification._id);
                        }
                        // Delete follow_accepted and message notifications after viewing
                        if (notification.type === 'follow_accepted' || notification.type === 'message') {
                          setTimeout(async () => {
                            try {
                              await axios.delete(
                                `${serverURL}/notifications/${notification._id}`,
                                { withCredentials: true }
                              );
                              // Remove from local state immediately
                              setNotifications(prev => prev.filter(n => n._id !== notification._id));
                              if (!notification.read) {
                                setUnreadCount(prev => Math.max(0, prev - 1));
                              }
                            } catch (error) {
                              console.error("Error deleting notification:", error);
                            }
                          }, 500);
                        }
                        setShowDropdown(false);
                      }
                    }}
                  >
                    {notification.type === 'follow_request' ? (
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                          {notification.sender?.photoURL ? (
                            <img
                              src={notification.sender.photoURL}
                              alt={notification.sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {notification.sender?.name?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => handleAcceptFollowRequest(e, notification._id, notification.sender._id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium transition-all flex items-center gap-1"
                            >
                              <BsCheck2 className="text-sm" />
                              Accept
                            </button>
                            <button
                              onClick={(e) => handleRejectFollowRequest(e, notification._id, notification.sender._id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-all flex items-center gap-1"
                            >
                              <BsX className="text-sm" />
                              Reject
                            </button>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    ) : (
                      <Link to={notification.link || "#"}>
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-zinc-700">
                            {notification.sender?.photoURL ? (
                              <img
                                src={notification.sender.photoURL}
                                alt={notification.sender.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {notification.sender?.name?.charAt(0) || "?"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">
                              {notification.message}
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

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
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <BsTrash />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
