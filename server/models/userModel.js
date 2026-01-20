import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    followers: [
      {
        type: ObjectId,
        ref: "User",
        index: true
      }
    ],

    following: [
      {
        type: ObjectId,
        ref: "User",
        index: true
      }
    ],

    profileImage: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      trim: true,
      default: "Hi there! I am using Instaio."
    },

    savedPosts: [
      {
        type: ObjectId,
        ref: "Post",
        index: true
      }
    ],

    isPrivate: {
      type: Boolean,
      default: false
    },
    
    refreshToken: {
      type: String
    },

    resetToken: {
      type: String
    },

    resetTokenExpiration: {
      type: Date
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Convert username in lowercase before saving
userSchema.pre('save', function () {
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase().trim();
  }
});

export default mongoose.model("User", userSchema);
