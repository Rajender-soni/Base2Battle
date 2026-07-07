import { Server } from "socket.io";
import Room from "../model/roomModel.js";
import Match from "../model/matchModel.js";
import MatchParticipant from "../model/matchParticipantModel.js";
import Submission from "../model/submissionModel.js";
import Message from "../model/messageModel.js";
import Notification from "../model/notificationModel.js";
import User from "../model/userModel.js";

let io;

// Store user socket mappings and room data
const userSocketMap = new Map(); // userId -> socketId
const roomHostMap = new Map(); // roomId -> hostUserId
const matchEndMap = new Map(); // matchId -> { player1Left: bool, player2Left: bool }

/**
 * Checks if a room is empty and 'waiting', and if so, deletes it.
 * Only deletes 'waiting' rooms that have been empty for a grace period.
 * This prevents cleanup of newly created rooms where host hasn't joined socket yet.
 * @param {string} roomId - The ID of the room to check.
 */
const checkAndCleanupRoom = async (roomId) => {
  if (!io || !roomId) return;

  try {
    const socketsInRoom = await io.in(roomId).allSockets();

    if (socketsInRoom.size === 0) {
      console.log(`[Socket Cleanup] Room ${roomId} is empty. Checking for deletion.`);

      // Get room to check creation time
      const room = await Room.findOne({ roomId, status: "waiting" });
      
      if (!room) {
        console.log(`[Socket Cleanup] Room ${roomId} not found or not in waiting status.`);
        return;
      }

      // Don't cleanup rooms created less than 60 seconds ago (grace period for host/opponent to join socket)
      const roomAge = Date.now() - new Date(room.createdAt).getTime();
      const gracePeroidMs = 60000; // 60 seconds
      
      if (roomAge < gracePeroidMs) {
        console.log(`[Socket Cleanup] Room ${roomId} is too new (${Math.floor(roomAge/1000)}s old). Skipping cleanup.`);
        return;
      }

      // Only delete rooms that are in 'waiting' status and old enough
      const deletedRoom = await Room.findOneAndDelete({
        roomId: roomId,
        status: "waiting",
      });

      if (deletedRoom) {
        console.log(`✅ [Socket Cleanup] Deleted empty waiting room ${roomId} (${Math.floor(roomAge/1000)}s old).`);
        roomHostMap.delete(roomId);
      }
    } else {
      console.log(`[Socket Info] Room ${roomId} has ${socketsInRoom.size} user(s).`);
    }
  } catch (error) {
    console.error(`❌ [Socket Cleanup] Error cleaning up room ${roomId}:`, error);
  }
};

/**
 * Handles room destruction when host leaves
 */
const destroyRoomOnHostLeave = async (roomId, hostId) => {
  try {
    console.log(`[Host Left] 🚫 Host ${hostId} left room ${roomId}. Destroying room...`);

    // Notify all other participants
    io.to(roomId).emit("room-cancelled", { 
      reason: "Host has left the room" 
    });

    // Remove all sockets from the room
    io.in(roomId).socketsLeave(roomId);

    // Delete the room from database
    const deletedRoom = await Room.findOneAndDelete({ roomId });
    
    if (deletedRoom) {
      console.log(`✅ [Host Left] Room ${roomId} destroyed successfully`);
    }

    // Clean up maps
    roomHostMap.delete(roomId);
  } catch (error) {
    console.error(`❌ [Host Left] Error destroying room ${roomId}:`, error);
  }
};

/**
 * Calculate match results when both players end
 */
const calculateMatchResults = async (matchId) => {
  try {
    const match = await Match.findById(matchId);
    if (!match) return null;

    // Get participants
    const participants = await MatchParticipant.find({ matchId }).populate('userId', 'name photoURL');
    
    if (participants.length !== 2) return null;

    const [p1, p2] = participants;
    
    // Calculate solve times and scores
    const getSolveStats = (p) => {
      let score = 0;
      let totalTime = 0;
      p.problems?.forEach(pr => {
        if (pr.status === 'solved') {
          score++;
          if (pr.lastSubmissionTime && match.createdAt) {
            totalTime += (new Date(pr.lastSubmissionTime).getTime() - new Date(match.createdAt).getTime());
          }
        }
      });
      return { score, totalTime };
    };

    const p1Stats = getSolveStats(p1);
    const p2Stats = getSolveStats(p2);
    const p1Score = p1Stats.score;
    const p2Score = p2Stats.score;

    let winner = null;
    let isDraw = false;
    let winnerTime = 0;

    if (p1Score > p2Score) {
      winner = p1.userId._id;
      winnerTime = p1Stats.totalTime;
    } else if (p2Score > p1Score) {
      winner = p2.userId._id;
      winnerTime = p2Stats.totalTime;
    } else {
      // Tie breaker based on speed
      if (p1Score > 0 && p1Stats.totalTime < p2Stats.totalTime) {
        winner = p1.userId._id;
        winnerTime = p1Stats.totalTime;
      } else if (p2Score > 0 && p2Stats.totalTime < p1Stats.totalTime) {
        winner = p2.userId._id;
        winnerTime = p2Stats.totalTime;
      } else {
        isDraw = true; // Both 0 score, or exactly same time
      }
    }

    // Update match with results
    await Match.findByIdAndUpdate(matchId, {
      scoreHost: p1Score,
      scoreChallenger: p2Score,
      winner: isDraw ? 'draw' : winner.toString(),
    });

    // Update user ratings based on speed and match history
    if (!isDraw) {
      const winnerUser = await User.findById(winner);
      const loserUser = await User.findById(winner.toString() === p1.userId._id.toString() ? p2.userId._id : p1.userId._id);

      // Calculate speed bonus
      let ratingGain = 10;
      if (winnerTime > 0 && match.duration > 0) {
        // match.duration is in seconds
        const maxTime = match.duration * 1000 * Math.max(1, p1Score); 
        const speedRatio = Math.max(0, 1 - (winnerTime / maxTime));
        const speedBonus = Math.floor(15 * speedRatio); // Up to +15 extra points
        ratingGain += speedBonus;
      }
      
      if (winnerUser && loserUser) {
        await User.findByIdAndUpdate(winner, { $inc: { rating: ratingGain }, $push: { matches: matchId } });
        await User.findByIdAndUpdate(loserUser._id, { $inc: { rating: -5 }, $push: { matches: matchId } });
      }
    } else {
      // For draw, just update matches array for both players
      await User.findByIdAndUpdate(p1.userId._id, { $push: { matches: matchId } });
      await User.findByIdAndUpdate(p2.userId._id, { $push: { matches: matchId } });
    }

    return {
      matchId,
      players: participants.map(p => ({
        userId: p.userId._id,
        name: p.userId.name,
        photoURL: p.userId.photoURL,
        score: p.userId._id.toString() === p1.userId._id.toString() ? p1Score : p2Score,
        problemsSolved: p.problems?.filter(pr => pr.status === 'solved').length || 0,
      })),
      winner: isDraw ? 'draw' : winner,
      isDraw,
    };
  } catch (error) {
    console.error(`❌ [Calculate Results] Error:`, error);
    return null;
  }
};


export const setupSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://leetcompete-client.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket Connect] 🟢 User connected: ${socket.id}`);

    // --- User Authentication for Chat ---
    socket.on("authenticate", ({ userId }) => {
      if (userId) {
        socket.data.userId = userId;
        userSocketMap.set(userId, socket.id);
        console.log(`[Auth] ✅ User ${userId} authenticated`);
        
        socket.join(`user:${userId}`);
      }
    });

    // --- Join Room Event ---
    socket.on("join-room", async ({ roomId, userId, name, photoURL }) => {
      if (!roomId || !userId) {
        console.log(`❌ [Join Room] Invalid data from ${socket.id}`);
        return;
      }

      try {
        // Get room details to check if user is host or opponent
        const room = await Room.findOne({ roomId });
        if (!room) {
          console.log(`❌ [Join Room] Room ${roomId} not found in database`);
          socket.emit("room-error", { message: "Room not found" });
          return;
        }

        console.log(`[Join Room] Room ${roomId} found. Status: ${room.status}, Host: ${room.host}, Opponent: ${room.opponent}`);

        // Determine if this user is the host or opponent
        const isHost = room.host.toString() === userId;
        const isOpponent = room.opponent?.toString() === userId;
        
        // Check if user is authorized to be in this room
        if (!isHost && !isOpponent) {
          console.log(`❌ [Join Room] User ${userId} is neither host nor opponent of room ${roomId}`);
          socket.emit("room-error", { message: "You are not authorized to join this room" });
          return;
        }

        // Check if room is full (only allow host and opponent)
        const socketsInRoom = await io.in(roomId).allSockets();
        if (socketsInRoom.size >= 2 && !socketsInRoom.has(socket.id)) {
          console.log(`❌ [Join Room] Room ${roomId} is full (${socketsInRoom.size} users)`);
          socket.emit("room-error", { message: "Room is full" });
          return;
        }

        // Prevent duplicate joins
        if (socket.data.joinedRoom === roomId) {
          console.log(`[Join Room] User ${userId} already in room ${roomId}`);
          return;
        }
        
        // Store room host
        if (isHost) {
          roomHostMap.set(roomId, userId);
        }

        // Store user data on socket
        socket.data.joinedRoom = roomId;
        socket.data.userId = userId;
        socket.data.name = name;
        socket.data.photoURL = photoURL;
        socket.data.isHost = isHost;

        socket.join(roomId);
        console.log(`[Join Room] ✅ ${name} (${userId}) joined room ${roomId} as ${isHost ? 'HOST' : 'OPPONENT'}`);

        // Note: Room status and opponent were already set by the /rooms/join API
        // No need to update again here

        // Notify others in the room that opponent has joined
        socket.to(roomId).emit("opponent-joined", { userId, name, photoURL });
      } catch (error) {
        console.error(`❌ [Join Room] Error:`, error);
        socket.emit("room-error", { message: "Failed to join room" });
      }
    });

    // --- Leave Room Event ---
    socket.on("leave-room", async ({ roomId, userId }) => {
      if (socket.data.joinedRoom === roomId) {
        const isHost = socket.data.isHost;
        
        socket.leave(roomId);
        socket.data.joinedRoom = null;
        console.log(`[Leave Room] 👋 User ${userId} left room ${roomId}`);

        // Get room status to determine action
        const room = await Room.findOne({ roomId });
        if (!room) {
          console.log(`[Leave Room] Room ${roomId} not found (already deleted)`);
          return;
        }

        // Don't destroy room if match has started (status is 'started')
        if (room.status === 'started') {
          console.log(`[Leave Room] Match in progress - not destroying room ${roomId}`);
          return;
        }

        // If host leaves before match starts, destroy the room
        if (isHost) {
          await destroyRoomOnHostLeave(roomId, userId);
        } else {
          // Notify others in the room that opponent left
          socket.to(roomId).emit("opponent-left", { userId });
          
          // Update room status back to waiting (only if not started)
          if (room.status !== 'started') {
            await Room.findOneAndUpdate(
              { roomId },
              { status: 'waiting', opponent: null }
            );
          }

          // Check if the room is now empty and needs cleanup (only for waiting rooms)
          await checkAndCleanupRoom(roomId);
        }
      }
    });

    // --- Cancel Room Event (from host) ---
    socket.on("cancel-room", async ({ roomId, userId }) => {
      if (!roomId || !userId) {
        console.log(`❌ [Cancel Room] Missing roomId or userId`);
        socket.emit("room-error", { message: "Room ID and User ID are required" });
        return;
      }

      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          console.log(`❌ [Cancel Room] Room ${roomId} not found`);
          socket.emit("room-error", { message: "Room not found" });
          return;
        }

        // Verify user is host
        if (room.host.toString() !== userId) {
          console.log(`❌ [Cancel Room] User ${userId} is not the host`);
          socket.emit("room-error", { message: "Only host can cancel the room" });
          return;
        }

        console.log(`[Cancel Room] ❌ Room ${roomId} cancelled by host ${userId}`);

        // Notify all other participants
        socket.to(roomId).emit("room-cancelled", { 
          roomId,
          reason: "Host cancelled the room" 
        });

        // Delete room from database
        await Room.findOneAndDelete({ roomId });

        // Remove all sockets from the room
        io.in(roomId).socketsLeave(roomId);

        // Clean up
        roomHostMap.delete(roomId);

        socket.emit("room-cancelled-success", { message: "Room cancelled successfully" });
      } catch (error) {
        console.error(`❌ [Cancel Room] Error:`, error);
        socket.emit("room-error", { message: "Failed to cancel room" });
      }
    });

    // --- Chat Message Event (Room Chat) ---
    socket.on("send-message", ({ roomId, sender, name, text }) => {
      if (!roomId || !text || !sender) {
        console.log("❌ [Chat] Invalid message data");
        socket.emit("message-error", { message: "Invalid message data" });
        return;
      }

      // Trim and validate message content
      const trimmedText = text.trim();
      if (trimmedText.length === 0) {
        return;
      }

      if (trimmedText.length > 500) {
        socket.emit("message-error", { message: "Message too long (max 500 characters)" });
        return;
      }

      console.log(`💬 [Room Chat] ${name} in ${roomId}: ${trimmedText.substring(0, 50)}...`);
      
      // Broadcast message to all users in the room (including sender)
      io.to(roomId).emit("receive-message", {
        sender,
        name,
        text: trimmedText,
        timestamp: new Date().toISOString()
      });
    });

    // --- Start Match Event (Host only) ---
    socket.on("start-match", async ({ roomId, metadata }) => {
      if (!metadata) {
        console.log(`❌ Match start failed: Metadata missing for room ${roomId}`);
        return;
      }

      try {
        // Verify user is host
        const room = await Room.findOne({ roomId });
        if (!room) {
          console.log(`❌ [Start Match] Room ${roomId} not found`);
          return;
        }

        const userId = socket.data.userId;
        if (room.host.toString() !== userId) {
          console.log(`❌ [Start Match] User ${userId} is not the host`);
          socket.emit("match-error", { message: "Only host can start the match" });
          return;
        }

        // Check if room has 2 players
        const socketsInRoom = await io.in(roomId).allSockets();
        if (socketsInRoom.size < 2) {
          console.log(`❌ [Start Match] Room ${roomId} needs 2 players`);
          socket.emit("match-error", { message: "Waiting for opponent to join" });
          return;
        }

        console.log(`🎮 Match starting in room ${roomId} with duration: ${metadata.duration} mins`);

        const startTime = Date.now();

        // Create Match document
        const match = await Match.create({
          host: room.host,
          challenger: room.opponent,
          problems: room.problems,
          duration: (metadata?.duration || room.metadata?.duration || 30) * 60, // Stored in seconds
          winner: null,
        });

        // Create MatchParticipant for host
        await MatchParticipant.create({
          userId: room.host,
          matchId: match._id,
          problems: room.problems.map((pId) => ({
            problemId: pId,
            status: "not_attempted",
            attempts: 0,
            bestScore: 0,
          })),
          status: "active",
        });

        // Create MatchParticipant for challenger
        await MatchParticipant.create({
          userId: room.opponent,
          matchId: match._id,
          problems: room.problems.map((pId) => ({
            problemId: pId,
            status: "not_attempted",
            attempts: 0,
            bestScore: 0,
          })),
          status: "active",
        });

        // Update room status and store matchId
        await Room.findOneAndUpdate(
          { roomId },
          { 
            status: 'started',
            matchId: match._id
          }
        );

        // Always use the DB's duration — never trust client-sent metadata
        const authorDuration = room.metadata?.duration || 30;
        const authorMetadata = {
          duration: authorDuration,
          totalProblems: room.problems.length,
          difficulty: room.metadata?.difficulty || 'medium',
        };

        // Broadcast to all players in the room with authoritative metadata
        io.to(roomId).emit("match-started", {
          startTime: startTime,
          matchId: match._id,
          metadata: authorMetadata   // Same value for BOTH players — from DB
        });
      } catch (error) {
        console.error(`❌ [Start Match] Error:`, error);
        socket.emit("match-error", { message: "Failed to start match" });
      }
    });


    // --- End Match Event (Both players can end) ---
    socket.on("end-match", async ({ roomId, matchId, userId }) => {
      try {
        console.log(`[End Match] 🏁 User ${userId} ending match ${matchId} in room ${roomId}`);

        const room = await Room.findOne({ roomId });
        if (!room) {
          console.log(`❌ [End Match] Room ${roomId} not found`);
          return;
        }

        // Initialize tracking for this match if not exists
        if (!matchEndMap.has(matchId)) {
          matchEndMap.set(matchId, { 
            player1Id: room.host.toString(),
            player2Id: room.opponent?.toString(),
            player1Left: false, 
            player2Left: false 
          });
        }

        const matchEnd = matchEndMap.get(matchId);
        
        // Mark this player as having left/ended
        if (matchEnd.player1Id === userId) {
          matchEnd.player1Left = true;
        } else if (matchEnd.player2Id === userId) {
          matchEnd.player2Left = true;
        }

        // Notify opponent that this player ended
        socket.to(roomId).emit("opponent-ended-match", { userId });

        // If both players have ended, calculate and send results
        if (matchEnd.player1Left && matchEnd.player2Left) {
          console.log(`[End Match] ✅ Both players ended. Calculating results for match ${matchId}`);

          const results = await calculateMatchResults(matchId);

          if (results) {
            // Broadcast final results to both players
            io.to(roomId).emit("match-results", results);
            console.log(`[End Match] 📊 Results sent for match ${matchId}`);
          }

          // Clean up
          matchEndMap.delete(matchId);
          
          // Delete the room
          await Room.findOneAndDelete({ roomId });
          roomHostMap.delete(roomId);

          // Remove all sockets from room
          io.in(roomId).socketsLeave(roomId);
        } else {
          console.log(`[End Match] ⏳ Waiting for other player to end match ${matchId}`);
          socket.emit("waiting-for-opponent", { 
            message: "Waiting for opponent to end match..." 
          });
        }
      } catch (error) {
        console.error(`❌ [End Match] Error:`, error);
        socket.emit("match-error", { message: "Failed to end match" });
      }
    });

    // --- Handle Disconnection ---
    socket.on("disconnect", async () => {
      const roomId = socket.data.joinedRoom;
      const userId = socket.data.userId;
      const isHost = socket.data.isHost;

      if (roomId && userId) {
        console.log(`[Socket Disconnect] 🔴 User ${userId} disconnected from room ${roomId}`);

        // Get room status to determine action
        const room = await Room.findOne({ roomId });
        
        // Don't destroy room if match has started
        if (room && room.status === 'started') {
          console.log(`[Socket Disconnect] Match in progress - not destroying room ${roomId}`);
          socket.to(roomId).emit("opponent-disconnected", { userId });
        } else if (isHost) {
          // If host disconnects before match starts, destroy the room
          await destroyRoomOnHostLeave(roomId, userId);
        } else {
          // Notify others that opponent disconnected
          socket.to(roomId).emit("opponent-disconnected", { userId });

          // Update room status (only if not started)
          if (room && room.status !== 'started') {
            await Room.findOneAndUpdate(
              { roomId },
              { status: 'waiting', opponent: null }
            );
          }

          // Check if room needs cleanup (only for waiting rooms)
          await checkAndCleanupRoom(roomId);
        }

        // Clean up socket data
        socket.leave(roomId);
        socket.data = {};
      } else {
        console.log(`[Socket Disconnect] 🔴 User disconnected: ${socket.id}`);
      }

      // Remove from user socket map
      if (userId) {
        userSocketMap.delete(userId);
      }
    });

    // --- Code Sync Event ---
    socket.on("sync-code", ({ roomId, problemId, language, code, userId }) => {
      socket.to(roomId).emit("code-updated", {
        problemId,
        language,
        code,
        userId,
      });
    });

    // --- Code Submission Event ---
    socket.on("code-submitted", async ({ roomId, userId, problemId, code, language, result }) => {
      console.log(`[Submission] 📝 ${userId} submitted for problem ${problemId}`);
      
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          console.log(`❌ [Submission] Room ${roomId} not found`);
          return;
        }

        const matchId = room.matchId;
        
        // Save submission to database
        await Submission.create({
          userId,
          problemId,
          matchId,
          code: code || "",
          language: language || "cpp",
          status: result.status || (result.allPassed ? "Accepted" : "Wrong Answer"),
          results: result,
          submittedAt: new Date()
        });

        // Update MatchParticipant
        const participant = await MatchParticipant.findOne({ userId, matchId });
        if (participant) {
          const problemProgress = participant.problems.find(p => 
            p.problemId?.toString() === problemId?.toString()
          );
          
          if (problemProgress) {
            if (result.allPassed) {
              if (problemProgress.status !== 'solved') {
                problemProgress.status = 'solved';
                problemProgress.attempts += 1;
                problemProgress.lastSubmissionTime = new Date();
                problemProgress.bestScore = 100;
                participant.totalScore += 1;
                await participant.save();
              }
            } else {
              problemProgress.attempts += 1;
              problemProgress.status = 'attempted';
              problemProgress.lastSubmissionTime = new Date();
              await participant.save();
            }
          } else {
            // Push new problem progress
            participant.problems.push({
              problemId,
              status: result.allPassed ? "solved" : "attempted",
              attempts: 1,
              lastSubmissionTime: new Date(),
              bestScore: result.allPassed ? 100 : 0
            });
            if (result.allPassed) {
              participant.totalScore += 1;
            }
            await participant.save();
          }
        }

        console.log(`✅ [Submission Saved] Submission saved for user ${userId}`);

        // Broadcast to opponent
        socket.to(roomId).emit("opponent-submitted", {
          userId,
          problemId,
          result,
        });

        // Send back to the sender to update their navbar/local UI!
        socket.emit("my-submission", {
          userId,
          problemId,
          result,
        });
      } catch (error) {
        console.error(`❌ [Submission Save Error]:`, error);
      }
    });

    // --- Problem Change Event ---
    socket.on("change-problem", ({ roomId, problemIndex, userId }) => {
      console.log(`[Problem Change] 🔄 ${userId} changed to problem ${problemIndex} in ${roomId}`);
      socket.to(roomId).emit("opponent-changed-problem", {
        problemIndex,
        userId,
      });
    });

    // --- Private Messaging Events ---
    socket.on("send-private-message", async ({ receiverId, content }) => {
      try {
        const senderId = socket.data.userId;
        
        if (!senderId) {
          console.log(`❌ [Private Message] Sender not authenticated`);
          return;
        }

        if (!content || !content.trim()) {
          console.log(`❌ [Private Message] Empty message`);
          return;
        }

        // Get sender info
        const sender = await User.findById(senderId).select('name photoURL playerId following');
        
        // Check if they follow each other OR have existing conversation
        const hasExistingConversation = await Message.exists({
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
          ]
        });

        if (!sender || (!sender.following.includes(receiverId) && !hasExistingConversation)) {
          console.log(`❌ [Private Message] Not allowed to message this user`);
          socket.emit("message-error", { message: "You can only message users you follow" });
          return;
        }

        // Save message to database
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

        // Emit to sender
        socket.emit("private-message-sent", populatedMessage);

        // Emit to receiver if online (NOT to sender to avoid self-notification)
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId && receiverId !== senderId) {
          io.to(receiverSocketId).emit("private-message-received", populatedMessage);
          
          // Send notification update only to receiver
          io.to(`user:${receiverId}`).emit("new-notification", {
            type: 'message',
            sender: { name: sender.name, photoURL: sender.photoURL },
            message: `${sender.name} sent you a message`
          });
        }

        console.log(`💬 [Private Message] ${sender.name} -> ${receiverId}: ${content.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ [Private Message Error]:`, error);
        socket.emit("message-error", { message: "Failed to send message" });
      }
    });

    // --- Typing Indicator ---
    socket.on("typing", ({ receiverId, isTyping }) => {
      const senderId = socket.data.userId;
      if (!senderId) return;

      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user-typing", {
          userId: senderId,
          isTyping
        });
      }
    });

    // --- Mark Messages as Read ---
    socket.on("mark-messages-read", async ({ senderId }) => {
      try {
        const userId = socket.data.userId;
        if (!userId) return;

        await Message.updateMany(
          { sender: senderId, receiver: userId, read: false },
          { read: true }
        );

        // Notify sender that messages were read
        const senderSocketId = userSocketMap.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages-read", { readBy: userId });
        }
      } catch (error) {
        console.error(`❌ [Mark Messages Read Error]:`, error);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call setupSocketServer first.");
  }
  return io;
};