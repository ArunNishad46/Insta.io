import fs from "fs";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import cloudinaryUpload from "../utils/cloudinaryUpload.js";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption || caption.trim() === "") {
      return res.status(400).json({ message: "Caption is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least 1 media is required" });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ message: "Maximum 5 media files allowed" });
    }

    const uploadedMedia = [];

    for (const file of req.files) {
      const uploadResult = await cloudinaryUpload(file.path, "posts");
      uploadedMedia.push({
        url: uploadResult.url,
        type: uploadResult.type
      });
      fs.unlinkSync(file.path);
    }

    const post = await Post.create({
      caption,
      media: uploadedMedia,
      postedBy: req.user._id
    });

    res.status(201).json({
      message: "Post created successfully",
      post
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

// GET ALL POSTS
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "fullname username profileImage followers following")
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      media: post.media,
      caption: post.caption,
      postedBy: post.postedBy,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByMe: post.likes.some(l => l.toString() === req.user._id.toString()),
      isSavedByMe: req.user.savedPosts.includes(post._id),
      isFollowingByMe: post.postedBy.followers?.some(
        f => f.toString() === req.user._id.toString()
      ),
      followsMe: post.postedBy.following?.some(f => f.toString() === req.user._id.toString()),
    }));

    res.status(200).json({ posts: formattedPosts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// MY POSTS
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.user._id })
      .populate("postedBy", "fullname username profileImage")
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      media: post.media,
      caption: post.caption,
      postedBy: post.postedBy,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByMe: post.likes.some(l => l.toString() === req.user._id.toString()),
    }));

    res.status(200).json({ posts: formattedPosts });
  }catch (err) {
    res.status(500).json({ message: "Failed to fetch your posts" });
  }
};

// GET MY FOLLOWING POSTS
export const getMyFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("following savedPosts");

    const usersToShow = [...user.following, userId];

    const savedSet = new Set(user.savedPosts.map(id => id.toString()));

    const posts = await Post.find({
      postedBy: { $in: usersToShow }
    })
      .populate("postedBy", "fullname username profileImage followers following")
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      media: post.media,
      caption: post.caption,
      postedBy: post.postedBy,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByMe: post.likes.some(l => l.toString() === req.user._id.toString()),
      isSavedByMe: savedSet.has(post._id.toString()),
      isFollowingByMe: post.postedBy.followers?.some(
        f => f.toString() === req.user._id.toString()
      ),
      followsMe: post.postedBy.following?.some(f => f.toString() === req.user._id.toString()),
    }));  

    return res.status(200).json({ posts: formattedPosts });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch feed"
    });
  }
};

// GET USER POSTS
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ postedBy: userId }) 
      .populate("postedBy", "fullname username profileImage")
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      media: post.media,
      caption: post.caption,
      postedBy: post.postedBy,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByMe: post.likes.some(l => l.toString() === req.user._id.toString()),
    }));  

    res.status(200).json({ posts: formattedPosts });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
};

// LIKE OR UNLIKE POST
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId).select("likes");
    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const isLiked = post.likes.includes(userId);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        [isLiked ? "$pull" : "$addToSet"]: { likes: userId }
      },
      { new: true }
    ).select("likes");

    return res.status(200).json({
      message: isLiked ? "Post unliked" : "Post liked",
      likesCount: updatedPost.likes.length,
      isLikedByMe: !isLiked
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update like"
    });
  }
};

// GET LIKED POSTS
export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({
      likes: userId
    })
      .populate("postedBy", "username profileImage")
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      media: post.media,
      caption: post.caption,
      postedBy: post.postedBy,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByMe: true, 
      isSavedByMe: req.user.savedPosts.includes(post._id),
    }));

    return res.status(200).json({posts: formattedPosts});
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch liked posts"
    });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to delete this post"
      });
    }

    await User.updateMany(
      { savedPosts: postId },
      { $pull: { savedPosts: postId } }
    );

    await post.deleteOne();

    return res.status(200).json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete post"
    });
  }
};

// SAVE OR UNSAVE POST
export const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const user = await User.findById(userId).select("savedPosts");

    const isSaved = user.savedPosts.includes(postId);

    await User.findByIdAndUpdate(
      userId,
      {
        [isSaved ? "$pull" : "$addToSet"]: { savedPosts: postId }
      }
    );

    return res.status(200).json({
      message: isSaved ? "Post unsaved" : "Post saved"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update save status"
    });
  }
};

// GET SAVED POSTS
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("savedPosts");

    if (!user || user.savedPosts.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    const posts = await Post.find({
      _id: { $in: user.savedPosts }
    })
      .populate("postedBy", "fullname username profileImage")
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      media: post.media,
      caption: post.caption,
      postedBy: post.postedBy,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByMe: post.likes.includes(userId),
      isSavedByMe: true, 
    }));  

    return res.status(200).json({posts: formattedPosts});
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch saved posts"
    });
  }
};

// COMMENT ON POST
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }

    if (text.length > 200) {
      return res.status(400).json({
        message: "Comment too long"
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            text,
            postedBy: userId
          }
        }
      },
      { new: true }
    )
    .select("comments")
    .populate("comments.postedBy", "username profileImage");

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const newComment = post.comments[post.comments.length - 1];

    return res.status(200).json({
      message: "Comment added!",
      comment: {
        _id: newComment._id,
        text: newComment.text,
        createdAt: newComment.createdAt,
        user: newComment.postedBy
      },
      commentsCount: post.comments.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add comment"
    });
  }
};

// GET COMMENTS 
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
    .select("comments")
    .populate("comments.postedBy", "username profileImage")
    .lean();

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    return res.status(200).json({
      comments: post.comments.map(c => ({
        _id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        user: c.postedBy  
      })),
      commentsCount: post.comments.length
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch comments"
    });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId).select("comments postedBy");
    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    const isCommentOwner = comment.postedBy.toString() === userId.toString();

    const isPostOwner = post.postedBy.toString() === userId.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        message: "You are not allowed to delete this comment"
      });
    }

    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: { _id: commentId } }
    });

    return res.status(200).json({
      message: "Comment deleted!"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete comment"
    });
  }
};

// MY COMMENTS 
export const getMyComments = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({
      "comments.postedBy": userId
    })
      .select("comments caption media postedBy createdAt")
      .populate("postedBy", "username profileImage")
      .lean();

    const myComments = [];

    posts.forEach(post => {
      post.comments.forEach(comment => {
        if (comment.postedBy.toString() === userId.toString()) {
          myComments.push({
            _id: comment._id,   
            text: comment.text,
            createdAt: comment.createdAt,
            post: {
              _id: post._id, 
              caption: post.caption,
              media: post.media,
              postedBy: post.postedBy
            }
          });
        }
      });
    });

    res.status(200).json({
      comments: myComments
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch comments"
    });
  }
};
