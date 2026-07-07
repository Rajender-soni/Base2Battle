import FollowRequest from "../model/followRequestModel.js";
import User from "../model/userModel.js";
import Notification from "../model/notificationModel.js";

// Send a follow request
export const sendFollowRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        const sender = await User.findById(senderId);
        if (sender.following.includes(receiverId)) {
            return res.status(400).json({ message: "Already following this user" });
        }

        // Check if request already exists
        const existingRequest = await FollowRequest.findOne({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Follow request already sent" });
        }

        // Create follow request
        const followRequest = await FollowRequest.create({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });

        // Check if notification already exists to prevent duplicates
        const existingNotification = await Notification.findOne({
            recipient: receiverId,
            sender: senderId,
            type: 'follow_request'
        });

        // Create notification only if it doesn't exist
        if (!existingNotification) {
            await Notification.create({
                recipient: receiverId,
                sender: senderId,
                type: 'follow_request',
                message: `${sender.name} sent you a follow request`,
                link: `/profile/${senderId}`
            });
        }

        res.status(201).json({ 
            message: "Follow request sent successfully",
            followRequest
        });
    } catch (error) {
        console.error('Send follow request error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Accept follow request
export const acceptFollowRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.params;

        const followRequest = await FollowRequest.findById(requestId);

        if (!followRequest) {
            return res.status(404).json({ message: "Follow request not found" });
        }

        if (followRequest.receiver.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (followRequest.status !== 'pending') {
            return res.status(400).json({ message: "Request already processed" });
        }

        // Update follow request status
        followRequest.status = 'accepted';
        await followRequest.save();

        // Update follower/following arrays
        await User.findByIdAndUpdate(followRequest.sender, {
            $addToSet: { following: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $addToSet: { followers: followRequest.sender }
        });

        // Delete the original follow request notification for the receiver
        await Notification.deleteOne({
            recipient: userId,
            sender: followRequest.sender,
            type: 'follow_request'
        });

        // Check if acceptance notification already exists to prevent duplicates
        const existingAcceptNotification = await Notification.findOne({
            recipient: followRequest.sender,
            sender: userId,
            type: 'follow_accepted'
        });

        // Create notification for sender only if it doesn't exist
        if (!existingAcceptNotification) {
            const receiver = await User.findById(userId);
            await Notification.create({
                recipient: followRequest.sender,
                sender: userId,
                type: 'follow_accepted',
                message: `${receiver.name} accepted your follow request`,
                link: `/profile/${userId}`
            });
        }

        res.status(200).json({ 
            message: "Follow request accepted",
            followRequest
        });
    } catch (error) {
        console.error('Accept follow request error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Reject follow request
export const rejectFollowRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.params;

        const followRequest = await FollowRequest.findById(requestId);

        if (!followRequest) {
            return res.status(404).json({ message: "Follow request not found" });
        }

        if (followRequest.receiver.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (followRequest.status !== 'pending') {
            return res.status(400).json({ message: "Request already processed" });
        }

        followRequest.status = 'rejected';
        await followRequest.save();

        // Delete the follow request notification for the receiver
        await Notification.deleteOne({
            recipient: userId,
            sender: followRequest.sender,
            type: 'follow_request'
        });

        res.status(200).json({ 
            message: "Follow request rejected",
            followRequest
        });
    } catch (error) {
        console.error('Reject follow request error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Cancel sent follow request (sender cancels their own request)
export const cancelFollowRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.params;

        const followRequest = await FollowRequest.findById(requestId);

        if (!followRequest) {
            return res.status(404).json({ message: "Follow request not found" });
        }

        // Check if the user is the sender of this request
        if (followRequest.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized - You can only cancel your own requests" });
        }

        if (followRequest.status !== 'pending') {
            return res.status(400).json({ message: "Request already processed" });
        }

        // Delete the request instead of just marking as cancelled
        await FollowRequest.findByIdAndDelete(requestId);

        res.status(200).json({ 
            message: "Follow request cancelled successfully"
        });
    } catch (error) {
        console.error('Cancel follow request error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get pending follow requests (received)
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await FollowRequest.find({
            receiver: userId,
            status: 'pending'
        })
        .populate('sender', 'name photoURL playerId')
        .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get sent follow requests
export const getSentRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await FollowRequest.find({
            sender: userId,
            status: 'pending'
        })
        .populate('receiver', 'name photoURL playerId')
        .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get followers list
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate('followers', 'name photoURL playerId rating');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ followers: user.followers });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get following list
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate('following', 'name photoURL playerId rating');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ following: user.following });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { targetUserId } = req.params;

        // Remove from following list
        await User.findByIdAndUpdate(userId, {
            $pull: { following: targetUserId }
        });

        // Remove from followers list
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: userId }
        });

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Search users by playerId
export const searchUserByPlayerId = async (req, res) => {
    try {
        const { playerId } = req.params;

        const user = await User.findOne({ playerId })
            .select('name photoURL playerId rating followers following');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Search user error:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};
