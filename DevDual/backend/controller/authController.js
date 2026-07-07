import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken } from "../config/token.js";
import { admin, isFirebaseReady } from "../config/firebaseConfig.js";

// Helper function to generate unique playerId
const generatePlayerId = async () => {
  let playerId;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate a random 8-character ID (uppercase letters and numbers)
    playerId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const existingUser = await User.findOne({ playerId });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return playerId;
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!validator.isEmail(email)){
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must have at least 8 characters" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const playerId = await generatePlayerId();
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      playerId,
    });
    const token = await genToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { password: _, ...userData } = newUser.toObject();
    return res.status(201).json({ ...userData, token });
  } catch (error) {
    return res.status(500).json({ message: `Sign Up Error: ${error.message}` });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    let isMatch = await bcrypt.compare(password, existingUser.password);
    if(!isMatch){
        return res.status(400).json({ message: "Incorrect email or password" });
    }
    const token = await genToken(existingUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { password: _, ...userData } = existingUser.toObject();
    return res.status(200).json({ ...userData, token });  
  } catch (error) {
    return res.status(500).json({ message: `Login Error: ${error.message}` });
  }
};

export const logout = async(req, res)=>{
    try {
        await res.clearCookie('token');
        res.status(200).json({message: 'Logout Successfully'});
    } catch (error) {
        return res.status(500).json({ message: `Logout Error: ${error.message}` });
    }
}

export const firebaseAuth = async (req, res) => {
    try {
        // Check if Firebase is properly configured
        if (!isFirebaseReady()) {
            return res.status(503).json({ 
                message: "Firebase authentication is not configured. Please contact the administrator.",
                error: "FIREBASE_NOT_CONFIGURED"
            });
        }

        const { firebaseToken } = req.body;
        
        if (!firebaseToken) {
            return res.status(400).json({ 
                message: "Missing Firebase token" 
            });
        }

        // Verify Firebase ID token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        } catch (error) {
            console.error('Firebase token verification error:', error);
            return res.status(401).json({ 
                message: "Invalid Firebase token" 
            });
        }

        const { uid: firebaseUid, email, name, picture, email_verified: emailVerified } = decodedToken;

        if (!firebaseUid || !email) {
            return res.status(400).json({ 
                message: "Missing required Firebase user data" 
            });
        }

        // Check if user already exists by firebaseUid or email
        let user = await User.findOne({ 
            $or: [
                { firebaseUid: firebaseUid },
                { email: email }
            ]
        });

        let isNewUser = false;

        if (user) {
            // Existing user - login flow
            if (!user.firebaseUid) {
                // User exists with email but no firebaseUid, link accounts
                user.firebaseUid = firebaseUid;
                user.authProvider = 'firebase';
                user.photoURL = picture || user.photoURL;
                user.emailVerified = emailVerified || user.emailVerified;
                await user.save();
            }
            
            // Generate token and set cookie (same as regular login)
            const token = await genToken(user._id);
            res.cookie("token", token, {
              httpOnly: true,
              secure: false,
              sameSite: "Lax",
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            const { password: _, ...userData } = user.toObject();
            return res.status(200).json({
              user: userData,
              token,
              isNewUser: false
            });
            
        } else {
            // New user - registration flow
            isNewUser = true;
            
            // Create placeholder password for Firebase users
            const placeholderPassword = await bcrypt.hash(Math.random().toString(36), 10);
            
            const newUser = await User.create({
                firebaseUid: firebaseUid,
                email: email,
                name: name || email.split('@')[0],
                photoURL: picture || "",
                authProvider: 'firebase',
                emailVerified: emailVerified || false,
                password: placeholderPassword // Required by schema but not used for Firebase users
            });

            // Generate token and set cookie (same as regular signup)
            const token = await genToken(newUser._id);
            res.cookie("token", token, {
              httpOnly: true,
              secure: false,
              sameSite: "Lax",
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            const { password: _, ...userData } = newUser.toObject();
            return res.status(201).json({
              user: userData,
              token,
              isNewUser: true
            });
        }

    } catch (error) {
        console.error('Firebase auth error:', error);
        return res.status(500).json({ 
            message: `Authentication failed: ${error.message}` 
        });
    }
};
