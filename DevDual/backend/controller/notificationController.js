import Notification from "../model/notificationModel.js";

// Get all notifications for the current user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name photoURL playerId')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        res.status(200).json({ count });
    } catch (error) {
        console.error('Get unread notification count error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ 
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Notification.findByIdAndDelete(notificationId);

        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await Notification.deleteMany({ recipient: userId });

        res.status(200).json({ 
            message: "All notifications cleared",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Clear all notifications error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Delete notifications by sender and type
export const deleteNotificationsBySender = async (req, res) => {
    try {
        const userId = req.user._id;
        const { senderId, type } = req.body;

        if (!senderId || !type) {
            return res.status(400).json({ message: "senderId and type are required" });
        }

        const result = await Notification.deleteMany({
            recipient: userId,
            sender: senderId,
            type: type
        });

        res.status(200).json({ 
            message: "Notifications deleted",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Delete notifications by sender error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};
