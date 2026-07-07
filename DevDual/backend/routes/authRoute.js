import express from 'express';
import { login, signup, logout, firebaseAuth } from '../controller/authController.js';
const authRouter = express.Router();
authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/firebase-auth', firebaseAuth);
authRouter.get('/logout', logout);
authRouter.get('/time', (req, res) => {
  res.status(200).json({ serverTime: Date.now() });
});
export default authRouter;