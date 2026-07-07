import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true, index: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'started'], // 'active' = full, 'started' = match in progress
    default: 'waiting',
    index: true
  },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
  metadata: {
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    duration: { type: Number, default: 30 }, // Duration in minutes
    categories: [String]
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Create compound index for efficient queries
RoomSchema.index({ roomId: 1, status: 1 });

// Auto-delete rooms after 24 hours (for cleanup of abandoned rooms)
RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Room = mongoose.model("Room", RoomSchema);
export default Room;