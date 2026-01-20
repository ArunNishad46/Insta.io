import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allPosts: [],
  profilePosts: [],
  feedPosts: [],
  savedPosts: [],
  likedPosts: [],
  myComments: [],
  loading: false
}

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setAllPosts: (state, action) => {
      state.allPosts = action.payload;
    },
    setProfilePosts: (state, action) => {
      state.profilePosts = action.payload;
    },
    setFeedPosts: (state, action) => {
      state.feedPosts = action.payload;
    },
    removeFromFeed: (state, action) => {
      const userId = action.payload;
      state.feedPosts = state.feedPosts.filter(p => p.postedBy._id !== userId);
    },
    setSavedPosts: (state, action) => {
      state.savedPosts = action.payload;
    },
    setLikedPosts: (state, action) => {
      state.likedPosts = action.payload;
    },
    setMyComments: (state, action) => {
      state.myComments = action.payload;
    },
    incrementCommentsCount(state, action) {
      const postId = action.payload;
      ["allPosts", "feedPosts", "profilePosts"].forEach(list => {
        state[list] = state[list]?.map(p =>
          p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        );
      });
    },
    decrementCommentsCount(state, action) {
      const postId = action.payload;
      ["allPosts", "feedPosts", "profilePosts"].forEach(list => {
        state[list] = state[list]?.map(p =>
          p._id === postId ? { ...p, commentsCount: p.commentsCount - 1 } : p
        );
      });
    },
    UpdateLikeState: (state, action) => {
      const { postId, isLiked, likesCount } = action.payload;
      ["feedPosts", "allPosts", "profilePosts", "savedPosts", "likedPosts"].forEach(list => {
        state[list] = state[list]?.map(p =>
          p._id === postId
            ? { ...p, isLikedByMe: isLiked, likesCount }
            : p
        );
      });
    },
    removePost(state, action) {
      const postId = action.payload;
      ["feedPosts", "allPosts", "profilePosts", "savedPosts", "likedPosts"].forEach(list => {
        state[list] = state[list]?.filter(p => p._id !== postId);
      });
    },
    removeMyComment: (state, action) => {
      const commentId = action.payload;
      state.myComments = state.myComments.filter(c => c._id !== commentId);
    },
    removeCommentFromPost: (state, action) => {
      const { postId, commentId } = action.payload;
    
      ["allPosts", "feedPosts", "profilePosts"].forEach(list => {
        state[list] = state[list]?.map(p => {
          if (p._id === postId) {
            return {
              ...p,
              comments: p.comments?.filter(c => c._id !== commentId),
              commentsCount: (p.commentsCount || 1) - 1 
            }
          }
          return p;
        });
      });
    },
    resetPosts: () => initialState,
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { 
  setAllPosts, 
  setProfilePosts,
  setFeedPosts,
  removeFromFeed,
  setSavedPosts, 
  setLikedPosts,
  setMyComments,
  removeMyComment,
  removeCommentFromPost,
  incrementCommentsCount,
  decrementCommentsCount, 
  UpdateLikeState,
  removePost,
  resetPosts,
  setLoading 
} = postSlice.actions;
export default postSlice.reducer;