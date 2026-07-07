import express from "express";
import { 
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    deleteNotificationsBySender
} from "../controller/notificationController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Notification routes - specific routes MUST come before parameterized routes
router.get("/", isAuth, getNotifications);
router.get("/unread-count", isAuth, getUnreadNotificationCount);
router.put("/read-all", isAuth, markAllNotificationsAsRead);
router.delete("/clear/all", isAuth, clearAllNotifications);
router.delete("/delete-by-sender", isAuth, deleteNotificationsBySender);
router.put("/:notificationId/read", isAuth, markNotificationAsRead);
router.delete("/:notificationId", isAuth, deleteNotification);

export default router;
