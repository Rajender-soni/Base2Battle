import Message from "../model/messageModel.js";
import User from "../model/userModel.js";
import Notification from "../model/notificationModel.js";

// Get conversation with a user
export const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
        .populate('sender', 'name photoURL playerId')
        .populate('receiver', 'name photoURL playerId')
        .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { sender: otherUserId, receiver: userId, read: false },
            { read: true }
        );

        res.status(200).json({ messages });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId, content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Message content is required" });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if they are following each other OR have existing conversation
        const sender = await User.findById(senderId);
        const hasExistingConversation = await Message.exists({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (!sender.following.includes(receiverId) && !hasExistingConversation) {
            return res.status(403).json({ 
                message: "You can only message users you follow" 
            });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name photoURL playerId')
            .populate('receiver', 'name photoURL playerId');

        // Create or update notification (prevent duplicates for unread messages from same sender)
        const existingNotification = await Notification.findOne({
            recipient: receiverId,
            sender: senderId,
            type: 'message',
            read: false
        });

        if (!existingNotification) {
            await Notification.create({
                recipient: receiverId,
                sender: senderId,
                type: 'message',
                message: `${sender.name} sent you a message`,
                link: `/messages/${senderId}`
            });
        } else {
            // Update the existing notification's timestamp
            existingNotification.createdAt = new Date();
            await existingNotification.save();
        }

        res.status(201).json({ 
            message: "Message sent successfully",
            data: populatedMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get all conversations (list of users you've chatted with)
export const getConversationsList = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all unique users the current user has chatted with
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
        .populate('sender', 'name photoURL playerId')
        .populate('receiver', 'name photoURL playerId')
        .sort({ createdAt: -1 });

        // Create a map to track unique conversations
        const conversationsMap = new Map();

        messages.forEach(msg => {
            const otherUserId = msg.sender._id.toString() === userId.toString() 
                ? msg.receiver._id.toString() 
                : msg.sender._id.toString();

            if (!conversationsMap.has(otherUserId)) {
                const otherUser = msg.sender._id.toString() === userId.toString() 
                    ? msg.receiver 
                    : msg.sender;

                conversationsMap.set(otherUserId, {
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }
        });

        // Count unread messages for each conversation
        for (let [otherUserId, conversation] of conversationsMap) {
            const unreadCount = await Message.countDocuments({
                sender: otherUserId,
                receiver: userId,
                read: false
            });
            conversation.unreadCount = unreadCount;
        }

        const conversations = Array.from(conversationsMap.values());

        res.status(200).json({ conversations });
    } catch (error) {
        console.error('Get conversations list error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const unreadCount = await Message.countDocuments({
            receiver: userId,
            read: false
        });

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};
