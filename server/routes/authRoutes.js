import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authMiddleware, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;