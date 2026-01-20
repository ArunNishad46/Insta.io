import { createSlice} from "@reduxjs/toolkit";

const initialState = {
  myProfile: null,
  publicProfile: null,
  loading: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setMyProfile: (state, action) => {
      state.myProfile = action.payload;
    },
    setPublicProfile: (state, action) => {
      state.publicProfile = action.payload;
    },
    updateFollowersCount: (state, action) => {
      const { userId, count } = action.payload;
    
      if (state.publicProfile?._id === userId) {
        state.publicProfile.followersCount = count;
      }
      if (state.myProfile?._id === userId) {
        state.myProfile.followersCount = count;
      }
    },
    updateFollowingCount: (state, action) => {
      const { userId, count } = action.payload;
      if (state.myProfile?._id === userId) {
        state.myProfile.followingCount = count;
      }
    },
    resetUser: () => initialState,
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { 
  setMyProfile, 
  setPublicProfile,
  updateFollowersCount,
  updateFollowingCount,
  resetUser, 
  setLoading 
} = userSlice.actions;
export default userSlice.reducer;