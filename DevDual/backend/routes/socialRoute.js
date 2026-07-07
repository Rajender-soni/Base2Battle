import express from "express";
import { 
    sendFollowRequest, 
    acceptFollowRequest, 
    rejectFollowRequest,
    cancelFollowRequest,
    getPendingRequests,
    getSentRequests,
    getFollowers,
    getFollowing,
    unfollowUser,
    searchUserByPlayerId
} from "../controller/socialController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Follow request routes
router.post("/follow-request", isAuth, sendFollowRequest);
router.put("/follow-request/:requestId/accept", isAuth, acceptFollowRequest);
router.put("/follow-request/:requestId/reject", isAuth, rejectFollowRequest);
router.delete("/follow-request/:requestId/cancel", isAuth, cancelFollowRequest);
router.get("/follow-requests/pending", isAuth, getPendingRequests);
router.get("/follow-requests/sent", isAuth, getSentRequests);

// Follow/Unfollow routes
router.delete("/unfollow/:targetUserId", isAuth, unfollowUser);

// Get followers/following
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);

// Search user
router.get("/search/:playerId", searchUserByPlayerId);

export default router;
