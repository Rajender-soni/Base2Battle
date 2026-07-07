import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import connectDB from "./config/connectDB.js";
import { initFirebaseAdmin } from "./config/firebaseConfig.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import problemRouter from "./routes/problemRoute.js";
import roomRouter from "./routes/roomRoute.js";
import evaluationRouter from "./routes/evaluationRoute.js";
import submissionRouter from "./routes/submissionRoute.js";
import socialRouter from "./routes/socialRoute.js";
import messageRouter from "./routes/messageRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import { setupSocketServer } from "./sockets/socketServer.js";

// Initialize Firebase Admin
initFirebaseAdmin();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://leetcompete-client.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/problems", problemRouter);
app.use("/api/social", socialRouter);
app.use("/api/messages", messageRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/evaluate", evaluationRouter);
app.use("/api/submissions", submissionRouter);

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

const server = http.createServer(app);
const io = setupSocketServer(server);
app.set("io", io);

connectDB(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
