import axios from "axios";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8080/api";
const SOCKET_URL = "http://localhost:8080";

const TEST_EMAIL = "opponent_test@gmail.com";
const TEST_PASSWORD = "SecurePassword123!";
const TEST_NAME = "Simulated Opponent";

async function run() {
  const roomId = process.argv[2];
  if (!roomId) {
    console.error("❌ Please provide a Room ID: node simulateOpponent.js <ROOM_ID>");
    process.exit(1);
  }

  console.log(`🚀 Starting simulated opponent for room: ${roomId}`);

  let token = "";
  let userId = "";

  // 1. Try to register user, if fails, try to login
  try {
    console.log(`Creating test opponent user (${TEST_EMAIL})...`);
    const signupRes = await axios.post(`${SERVER_URL}/auth/signup`, {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    token = signupRes.data.token;
    userId = signupRes.data._id;
    console.log(`✅ Opponent registered successfully. ID: ${userId}`);
  } catch (err) {
    if (err.response?.data?.message?.includes("exists") || err.response?.data?.error?.includes("exists")) {
      console.log(`ℹ️ User already exists. Logging in...`);
      try {
        const loginRes = await axios.post(`${SERVER_URL}/auth/login`, {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });
        token = loginRes.data.token;
        userId = loginRes.data._id;
        console.log(`✅ Logged in successfully. ID: ${userId}`);
      } catch (loginErr) {
        console.error("❌ Login failed:", loginErr.response?.data || loginErr.message);
        process.exit(1);
      }
    } else {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      process.exit(1);
    }
  }

  // 2. Join room via API
  try {
    console.log(`Joining Room ${roomId} via REST API...`);
    const joinRes = await axios.post(
      `${SERVER_URL}/rooms/join`,
      {
        roomId: roomId,
        opponentId: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("✅ Joined room via REST API. Problems count:", joinRes.data.problems?.length);
  } catch (err) {
    console.error("❌ Failed to join room via API:", err.response?.data || err.message);
    process.exit(1);
  }

  // 3. Connect to Socket Server
  console.log(`Connecting to Socket server: ${SOCKET_URL}...`);
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log(`✅ Connected to socket. ID: ${socket.id}`);
    
    // Authenticate
    socket.emit("authenticate", { userId });
    
    // Join room
    socket.emit("join-room", {
      roomId,
      userId,
      name: TEST_NAME,
      photoURL: "",
    });
    console.log(`Joined socket room: ${roomId}`);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("room-cancelled", (data) => {
    console.log("⚠️ Room was cancelled by host:", data.reason);
    socket.disconnect();
    process.exit(0);
  });

  // Track match progress
  let activeMatchId = null;
  let problemsList = [];

  socket.on("match-started", (data) => {
    console.log("🎮 MATCH STARTED! Official Server Start Time:", data.startTime);
    activeMatchId = data.matchId;
    
    // We can query the room or just wait a bit and simulate submitting
    console.log("⏳ Waiting 6 seconds before submitting code...");
    setTimeout(async () => {
      // Fetch room info to get the problem ID
      try {
        const roomRes = await axios.get(`${SERVER_URL}/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        problemsList = roomRes.data.problems || [];
        if (problemsList.length > 0) {
          const problemId = problemsList[0]._id;
          console.log(`📝 Submitting mock solution for problem: ${problemsList[0].title} (${problemId})...`);
          
          socket.emit("code-submitted", {
            roomId,
            userId,
            problemId,
            code: "print('Opponent solves the problem!')",
            language: "python",
            result: {
              status: "Accepted",
              allPassed: true,
              passedTests: 3,
              totalTests: 3,
              results: [
                { testCase: 1, passed: true },
                { testCase: 2, passed: true },
                { testCase: 3, passed: true }
              ]
            }
          });
          console.log("✅ Code submission event emitted to socket.");
        }
      } catch (err) {
        console.error("❌ Error retrieving problems for submission:", err.message);
      }
    }, 6000);
  });

  socket.on("opponent-submitted", (data) => {
    console.log(`ℹ️ Host submitted code:`, data.result);
  });

  socket.on("my-submission", (data) => {
    console.log(`ℹ️ Socket confirmed my submission:`, data.result);
    console.log("⏳ Waiting 3 seconds before ending match...");
    setTimeout(() => {
      console.log("🏁 Ending match...");
      socket.emit("end-match", { roomId, matchId: activeMatchId, userId });
    }, 3000);
  });

  socket.on("opponent-ended-match", (data) => {
    console.log(`🏁 Host has ended the match.`);
  });

  socket.on("match-results", (results) => {
    console.log("🏆 MATCH RESULTS RECEIVED:", JSON.stringify(results, null, 2));
    console.log("👋 Simulating exit and disconnecting...");
    socket.disconnect();
    console.log("🎉 Simulation finished successfully!");
    process.exit(0);
  });
}

run().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
