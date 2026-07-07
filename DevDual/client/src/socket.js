import { io } from "socket.io-client";

// Use environment variable for server URL, fallback to production
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || "https://leetcompete-server.onrender.com";

export const socket = io(SOCKET_SERVER_URL, {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

