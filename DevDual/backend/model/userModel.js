import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "Hi there! I'm using LeetCompete."
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false // Not required for Firebase users
    },
    photoURL: {
        type: String,
        default: ""
    },
    firebaseUid: {
        type: String,
        sparse: true,
        unique: true
    },
    authProvider: {
        type: String,
        enum: ['email', 'firebase', 'google'],
        default: 'email'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match"
    }],
    rating: {
        type: Number,
        default: 100
    },
    playerId: {
        type: String,
        unique: true,
        sparse: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true })

const User = mongoose.model('User', userSchema);
export default User;