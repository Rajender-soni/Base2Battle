import express from "express";
import { 
    getConversation,
    sendMessage,
    getConversationsList,
    getUnreadCount
} from "../controller/messageController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Message routes
router.get("/conversations", isAuth, getConversationsList);
router.get("/conversation/:otherUserId", isAuth, getConversation);
router.post("/send", isAuth, sendMessage);
router.get("/unread-count", isAuth, getUnreadCount);

export default router;
