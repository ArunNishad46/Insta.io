import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

/* Comment Sub-Schema */
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
      trim: true
    },

    media: [
      {
        url: { 
          type: String, 
          required: true 
        },
        type: { 
          type: String, 
          enum: ["image", "video"], 
          required: true 
        }
      }
    ],

    likes: [
      {
        type: ObjectId,
        ref: "User",
        index: true
      }
    ],

    comments: [commentSchema],

    postedBy: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ postedBy: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
