import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {uploadProfileImage} from "../middleware/uploadProfileMiddleware.js";
import {
  getMyProfile,
  updateProfileImage,
  deleteProfileImage,
  updateProfileDetails,
  changePassword,
  deleteAccount,
  getUserByUsername,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.put("/me/profile-image", authMiddleware, uploadProfileImage, updateProfileImage);
router.delete("/me/profile-image", authMiddleware, deleteProfileImage);
router.put("/me/update-details", authMiddleware, updateProfileDetails);
router.put("/me/change-password", authMiddleware, changePassword);
router.delete("/me/delete-account", authMiddleware, deleteAccount);
router.get("/profile/:username", authMiddleware, getUserByUsername);
router.get("/search-users", authMiddleware, searchUsers);
router.post("/follow/:userId", authMiddleware, followUser);
router.post("/unfollow/:userId", authMiddleware, unfollowUser);
router.get("/:userId/followers", authMiddleware, getFollowers);
router.get("/:userId/following", authMiddleware, getFollowing);

export default router;
