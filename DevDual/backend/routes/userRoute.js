import express from "express";
import isAuth from "../middlewares/isAuth.js";
import multer from "multer";
import { storage } from "../config/cloudinaryConfig.js";
import {
  getCurrentUser,
  updateDescription,
  updateName,
  getLeaderBoard,
  updatePhotoURL,
  getMatchHistory,
  getUserById,
} from "../controller/userController.js";

const userRouter = express.Router();
const upload = multer({ storage });

userRouter.get("/getcurrentuser", isAuth, getCurrentUser);
userRouter.post("/updateDescription", isAuth, updateDescription);
userRouter.post("/updateName", isAuth, updateName);
userRouter.post("/updatePhotoURL", isAuth, (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error:", err);
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }
    next();
  });
}, updatePhotoURL);
userRouter.get("/getleaderboard", getLeaderBoard);
userRouter.get("/getmatchhistory", isAuth, getMatchHistory);
userRouter.get("/:userId", getUserById);

export default userRouter;
