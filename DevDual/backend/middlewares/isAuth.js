import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fallback to Authorization: Bearer <token>
    if (!token) {
      const authHeader = req.headers?.authorization || req.headers?.Authorization;
      if (authHeader && typeof authHeader === "string") {
        const parts = authHeader.split(" ");
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
          token = parts[1];
        }
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Set both req.userId (for backward compatibility) and req.user (for full user object)
    req.userId = verifyToken.userId;
    
    // Fetch user object for controllers that need req.user._id
    const user = await User.findById(verifyToken.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(500).json({ message: `Auth Error: ${error}` });
  }
};
export default isAuth;
