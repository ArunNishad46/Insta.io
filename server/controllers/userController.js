import fs from "fs";
import User from "../models/userModel.js";
import cloudinaryUpload from "../utils/cloudinaryUpload.js";
import Post from "../models/postModel.js";
import cookieOptions from "../utils/cookieOptions.js";
import sendEmail from "../utils/sendEmail.js";

// GET MY PROFILE
export const getMyProfile = async (req, res) => {
  try {
    if(!req.user){
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id)
      .select("-password -refreshToken -resetToken -resetTokenExpiration")
      .lean();
    
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    const postsCount = await Post.countDocuments({
      postedBy: user._id,
    });

    return res.status(200).json({
      profile: {
        ...user,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}

// UPDATE PROFILE PICTURE
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const uploadResult = await cloudinaryUpload(
      req.file.path,
      "profile-images",
      true
    );

    fs.unlinkSync(req.file.path);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profileImage: uploadResult.url,
      },
      { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json({
      message: "Profile image updated",
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile image"
    });
  }
};

export const deleteProfileImage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user || !user.profileImage) {
      return res.status(400).json({ message: "No profile image to delete" });
    }

    user.profileImage = "";
    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .select("-password -refreshToken -resetToken -resetTokenExpiration");

    return res.status(200).json({
      message: "Profile image deleted",
      user: updatedUser
    });

  } catch (err) {
    return res.status(500).json({ message: "Failed to delete profile image" });
  }
};


// UPDATE PROFILE DETAILS
export const updateProfileDetails = async (req, res) => {
  try {
    const { fullname, username, email, bio, isPrivate } = req.body;

    const updates = {};

    if (fullname) updates.fullname = fullname;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;

    if (typeof isPrivate === "boolean") updates.isPrivate = isPrivate;

    if (username) {
      const exists = await User.findOne({
        username,
        _id: { $ne: req.user._id }
      });

      if (exists) {
        return res
          .status(400)
          .json({ message: "Username already taken" });
      }

      updates.username = username;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No fields to update"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      message: "Profile updated",
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    const isSamePassword = await user.matchPassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from old password"
      });
    }

    user.password = newPassword;
    user.refreshToken = null;    
    await user.save();

    res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(200)
      .json({
        message: "Password changed successfully. Please log in again."
      });

  } catch (err) {
    res.status(500).json({ message: "Failed to change password" });
  }
};

// DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required to delete account"
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    await Post.deleteMany({ postedBy: user._id });

    await User.updateMany(
      { savedPosts: user._id }, 
      { $pull: { savedPosts: user._id } }
    );

    await Post.updateMany(
      { likes: user._id },
      { $pull: { likes: user._id } }
    );

    await Post.updateMany(
      { "comments.postedBy": user._id },
      { $pull: { comments: { postedBy: user._id } } }
    );

    await User.updateMany(
      { followers: user._id },
      { $pull: { followers: user._id } }
    );

    await User.updateMany(
      { following: user._id },
      { $pull: { following: user._id } }
    );

    await User.findByIdAndDelete(user._id);

    await sendEmail({
      to: user.email,
      subject: "Account Deleted",
      html: `<p>Dear ${user.fullname},</p>
            <p>We're sorry to see you go. Your account has been successfully deleted from Instaio.</p>
            <p>If you have any feedback or questions, feel free to reach out to us.</p>
            <p>Best regards,<br/>The Instaio Team</p>`
    });

    res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(200)
      .json({
        message: "Account deleted successfully"
      });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete account" });
  }
};

// GET USER PROFILE BY USERNAME
export const getUserByUsername = async (req, res) => {
  try {
    const {username} = req.params;

    const user = await User.findOne({ username })
      .select(
        "-password -refreshToken -resetToken -resetTokenExpiration"
      )
      .populate("followers following", "fullname username profileImage");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isOwnProfile = req.user._id.toString() === user._id.toString();
    const isFollowing = user.followers.some(
      (f) => f._id.toString() === req.user._id.toString()
    );
    const followsMe = user.following.some(
      (f) => f._id.toString() === req.user._id.toString()
    );

    const posts = await Post.find({ postedBy: user._id })
      .populate("postedBy", "fullname username profileImage")
      .sort({ createdAt: -1 });

    const postCount = posts.length;

    const baseProfile = {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      isPrivate: user.isPrivate,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: postCount,
    };

    if (user.isPrivate && !isOwnProfile && !isFollowing) {
      return res.status(200).json({
        profile: {
          ...baseProfile,
          isFollowing,
          followsMe
        },
        private: true,
        followers: [],     
        following: [],
        posts: []
      });
    }

    return res.status(200).json({
      profile: {
        ...baseProfile,
        isFollowing,
        followsMe
      },
      private: false,
      followers: user.followers,
      following: user.following,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user"
    });
  }
};

// SEARCH USERS BY USERNAME
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    const searchQuery = query.trim();

    const users = await User.find({
      $or: [
        { username: { $regex: `^${searchQuery}`, $options: "i" } },
        { fullname: { $regex: searchQuery, $options: "i" } }
      ]
    })
      .select("username fullname profileImage")
      .limit(15)
      .lean();

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to search users"
    });
  }
};

// FOLLOW USER
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (userId.toString() === currentUserId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot follow yourself" });
    }

    const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: userId }},
        { new: true }
      ).select("following"),
      User.findByIdAndUpdate(userId, {
        $addToSet: { followers: currentUserId }},
        { new: true }
      ).select("followers"),
    ]);

    res.status(200).json({ 
      message: "User followed", 
      isFollowing: true,
      followingCount: updatedCurrentUser.following.length,
      followersCount: updatedTargetUser.followers.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to follow user" });
  }
};

// UNFOLLOW USER
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        message: "You cannot unfollow yourself"
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $pull: { following: userId }},
        { new: true }
      ).select("following"),
      User.findByIdAndUpdate(userId, {
        $pull: { followers: currentUserId }
      }, { new: true }).select("followers"),
    ]);

    res.status(200).json({ 
      message: "User unfollowed",
      isFollowing: false,
      followingCount: updatedCurrentUser.following.length,
      followersCount: updatedTargetUser.followers.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to unfollow user" });
  }
};

// GET FOLLOWERS
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("followers")
      .populate("followers", "username fullname profileImage followers following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user._id).select("following followers");

    const followersList = user.followers.map(u => ({
      _id: u._id,
      username: u.username,
      fullname: u.fullname,
      profileImage: u.profileImage,
      isFollowing: currentUser.following.some(f => f.toString() === u._id.toString()), 
      followsMe: currentUser.followers.some(f => f.toString() === u._id.toString())    
    }));

    res.status(200).json(followersList);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch followers" });
  }
};

// GET FOLLOWING
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("following")
      .populate("following", "username fullname profileImage followers following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user._id).select("following followers");

    const followingList = user.following.map(u => ({
      _id: u._id,
      username: u.username,
      fullname: u.fullname,
      profileImage: u.profileImage,
      isFollowing: currentUser.following.some(f => f.toString() === u._id.toString()), 
      followsMe: currentUser.followers.some(f => f.toString() === u._id.toString())    
    }));

    res.status(200).json(followingList);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch following" });
  }
};


