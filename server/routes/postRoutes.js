import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {uploadPostMedia} from "../middleware/uploadMiddleware.js";
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getMyFeedPosts,
  getUserPosts,
  toggleLike,
  getLikedPosts,
  deletePost,
  toggleSavePost,
  getSavedPosts,
  addComment,
  getComments,
  deleteComment,
  getMyComments
} from "../controllers/postController.js";

const router = express.Router();

router.post(
  "/create-post",
  authMiddleware,
  uploadPostMedia,
  createPost
);
router.get("/all-posts", authMiddleware, getAllPosts);
router.get("/my-feed-posts", authMiddleware, getMyFeedPosts);
router.get("/user-posts/:userId", authMiddleware, getUserPosts);
router.get("/my-posts", authMiddleware, getMyPosts);
router.put("/like-toggle/:postId", authMiddleware, toggleLike);
router.get("/liked-posts", authMiddleware, getLikedPosts);
router.delete("/delete-post/:postId", authMiddleware, deletePost);
router.put("/save-toggle/:postId", authMiddleware, toggleSavePost);
router.get("/saved-posts", authMiddleware, getSavedPosts);
router.post("/add-comment/:postId", authMiddleware, addComment);
router.get("/comments/:postId", authMiddleware, getComments);
router.delete("/delete-comment/:postId/:commentId", authMiddleware, deleteComment);
router.get("/my-comments", authMiddleware, getMyComments);

export default router;