import { createContext, useContext, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Axios from "../api/axiosApi";
import summaryApi from "../api/summaryApi";
import { toast } from "react-toastify";
import {
  setUser,
  updateUser,
  logoutUser,
  setLoading as setAuthLoading,
  setInitialized,
} from "../store/authSlice";
import { 
  setMyProfile,
  setPublicProfile,
  resetUser,
  setLoading as setUserLoading
} from "../store/userSlice";
import {
  setProfilePosts,
  setLikedPosts,
  setSavedPosts,
  setMyComments,
  removeMyComment,
  resetPosts,
  setLoading as setPostLoading,
  incrementCommentsCount,
  decrementCommentsCount,
  removeCommentFromPost
} from "../store/postSlice";

export const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);

  const apiRequest = async (api, payload = null, config = {}, silent = false) => {
    try {
      const { url, method } = typeof api === "function" ? api() : api;
      const response = await Axios({
        url,
        method,
        data: payload,
        ...config,
      });
      return response.data;
    }catch (error) {
      const message = error.response?.data?.message || "Something went wrong!";
      if(!silent){
        toast.error(message);
      }
      throw error;
    }
  };

  const identity = (u) => ({
    _id: u._id,
    username: u.username,
    fullname: u.fullname,
    email: u.email,
    profileImage: u.profileImage,
  });


  // AUTH ACTIONS
  const login = async (payload) => {
    dispatch(setAuthLoading(true));
    try {
      const data = await apiRequest(summaryApi.login, payload);
      dispatch(setUser(identity(data.user)));
      await fetchMyProfile();
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    }finally {
      dispatch(setAuthLoading(false));
    }
  };

  const register = async (payload) => {
    dispatch(setAuthLoading(true));
    try {
      const data = await apiRequest(summaryApi.register, payload);
      dispatch(setUser(identity(data.user)));
      await fetchMyProfile();
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    }finally {
      dispatch(setAuthLoading(false));
    }
  };

  const logout = async () => {
    dispatch(setAuthLoading(true));
    try {
      const data = await apiRequest(summaryApi.logout);
      dispatch(logoutUser());
      dispatch(resetUser());
      dispatch(resetPosts());
      toast.success(data.message);
    }finally {
      dispatch(setAuthLoading(false));
    }
  };

  const forgotPassword = async (email) => {
    dispatch(setAuthLoading(true));
    try {
      const data = await apiRequest(summaryApi.forgotPassword, { email });
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const resetPassword = async (token, payload) => {
    dispatch(setAuthLoading(true));
    try {
      const data = await apiRequest(summaryApi.resetPassword(token), payload);
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  // USER ACTIONS
  const fetchMyProfile = async () => {
    dispatch(setUserLoading(true));
    try {
      const data = await apiRequest(summaryApi.myProfile);
      const mergedProfile = {
        ...data.profile,
        followers: data.profile.followers || [],
        following: data.profile.following || [],
        posts: [] 
      };
  
      dispatch(setMyProfile(mergedProfile));
      dispatch(updateUser(identity(data.profile)));
    } finally {
      dispatch(setUserLoading(false));
    }
  };

  const fetchPublicProfile = async (username) => {
    dispatch(setUserLoading(true));
    try {
      const data = await apiRequest(summaryApi.publicProfile(username));
      const isFollowing = data.followers?.some(f => f._id === authUser?._id) || false;
      const mergedProfile = {
        ...data.profile,
        followers: data.private ? [] : data.followers,
        following: data.private ? [] : data.following,
        posts: data.private ? [] : data.posts,
        isFollowing
      };
      dispatch(setPublicProfile(mergedProfile));
      if (!data.private) {
        dispatch(setProfilePosts(data.posts));
      }
      return data;
    } finally { 
      dispatch(setUserLoading(false)); 
    }
  };
  
  const updateProfileImage = async (payload) => {
    dispatch(setUserLoading(true));
    try{
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const data = await apiRequest(summaryApi.updateProfileImage, payload, config);
      await fetchMyProfile();
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    }finally{
      dispatch(setUserLoading(false));
    }
  }

  const deleteProfileImage = async () => {
    dispatch(setUserLoading(true));
    try {
      const data = await apiRequest(summaryApi.deleteProfileImage);
      await fetchMyProfile();
      toast.success(data.message);
      return true;
    } catch (err) {
      return false;
    } finally {
      dispatch(setUserLoading(false));
    }
  };

  const updateProfileDetails = async (payload) => {
    dispatch(setUserLoading(true));
    try{
      const data = await apiRequest(summaryApi.updateProfileDetails, payload);
      await fetchMyProfile();
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    }finally{
      dispatch(setUserLoading(false));
    }
  }

  const deleteAccount = async (payload) => {
    dispatch(setUserLoading(true));
    try{
      const data = await apiRequest(summaryApi.deleteAccount, payload);
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    }finally{
      dispatch(setUserLoading(false));
    }
  }

  const changePassword = async (payload) => {
    dispatch(setUserLoading(true));
    try{
      const data = await apiRequest(summaryApi.changePassword, payload);
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    }finally{
      dispatch(setUserLoading(false));
    }
  }

  const followUser = async (userId) => {
    const res = await apiRequest(summaryApi.followUser(userId));
    return {
      followersCount: res.followersCount,
      followingCount: res.followingCount
    };
  };
  
  const unfollowUser = async (userId) => {
    const res = await apiRequest(summaryApi.unfollowUser(userId));
    return {
      followersCount: res.followersCount,
      followingCount: res.followingCount
    };
  };

  const fetchFollowers = async (userId) => {
    dispatch(setUserLoading(true));
    try {
      const data = await apiRequest(summaryApi.getFollowers(userId));
      return data || [];
    } finally {
      dispatch(setUserLoading(false));
    }
  };
  
  const fetchFollowing = async (userId) => {
    dispatch(setUserLoading(true));
    try {
      const data = await apiRequest(summaryApi.getFollowing(userId));
      return data || [];
    } finally {
      dispatch(setUserLoading(false));
    }
  };

  // POST ACTIONS
  const fetchAllPosts = useCallback(async (page = 1) => {
    const data = await apiRequest({
      ...summaryApi.getAllPosts,
      url: `/api/post/all-posts?page=${page}`
    });

    return data;
  }, []);

  const fetchFeedPosts = useCallback(async (page = 1) => {
    const data = await apiRequest({
      ...summaryApi.getMyFeedPosts,
      url: `/api/post/my-feed-posts?page=${page}`
    });

    return data;
  }, []);

  const fetchProfilePosts = async (userId) => {
    dispatch(setPostLoading(true));
    try {
      const data = await apiRequest(summaryApi.userPosts(userId));
      dispatch(setProfilePosts(data.posts));
    } finally {
      dispatch(setPostLoading(false));
    }
  };

  const createPost = async (formData) => {
    dispatch(setPostLoading(true));
    try{
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const data = await apiRequest(summaryApi.createPost, formData, config);
      toast.success(data.message);
      return true;
    }catch(err){
      return false;
    }finally{
      dispatch(setPostLoading(false));
    }
  };

  const toggleLike = async (postId) => {
    const data = await apiRequest(summaryApi.toggleLike(postId));
    return data;
  };

  const toggleSave = async (postId) => {
    const data = await apiRequest(summaryApi.toggleSave(postId));
    toast.success(data.message);
  };

  const fetchLikedPosts = async () => {
    dispatch(setPostLoading(true));
    try {
      const data = await apiRequest(summaryApi.getLikedPosts);
      dispatch(setLikedPosts(data.posts));
    } finally {
      dispatch(setPostLoading(false));
    }
  };

  const fetchComments = async (postId) => {
    const data = await apiRequest(summaryApi.getComments(postId));
    return {
      comments: data.comments || [],
      commentsCount: data.commentsCount
    }
  };
  
  const addComment = async (postId, payload) => {
    const data = await apiRequest(summaryApi.addComment(postId), payload);
    dispatch(incrementCommentsCount(postId));
    return data;
  };
  
  const deleteComment = async (postId, commentId) => {
    await apiRequest(summaryApi.deleteComment(postId, commentId));
    dispatch(decrementCommentsCount(postId));
    dispatch(removeMyComment(commentId));
    dispatch(removeCommentFromPost({ postId, commentId }));
  };

  const fetchSavedPosts = async () => {
    dispatch(setPostLoading(true));
    try {
      const data = await apiRequest(summaryApi.getSavedPosts);
      dispatch(setSavedPosts(data.posts));
    } finally {
      dispatch(setPostLoading(false));
    }
  };

  const fetchMyComments = async () => {
    dispatch(setPostLoading(true));
    try {
      const data = await apiRequest(summaryApi.getMyComments);
      dispatch(setMyComments(data.comments));
    } finally {
      dispatch(setPostLoading(false));
    }
  };

  const deletePost = async (postId) => {
    const data = await apiRequest(summaryApi.deletePost(postId));
    toast.success(data.message);
  };

  // AUTO INIT AUTH ON LOAD
  const initialize = async () => {
    try {
      const data = await apiRequest(summaryApi.refreshToken, null, {}, true);
      dispatch(setUser(identity(data.user)));
      await fetchMyProfile();
    } catch (error) {
      dispatch(logoutUser());
      dispatch(resetUser());
      dispatch(resetPosts());
    }finally {
      dispatch(setInitialized());
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value = useMemo(() => ({
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    fetchMyProfile,
    fetchPublicProfile,
    updateProfileImage,
    deleteProfileImage,
    updateProfileDetails,
    changePassword,
    deleteAccount,
    followUser,
    unfollowUser,
    fetchFollowers,
    fetchFollowing,
    fetchAllPosts,
    fetchFeedPosts,
    fetchProfilePosts,
    createPost,
    toggleLike,
    toggleSave,
    fetchLikedPosts,
    fetchSavedPosts,
    fetchComments,
    addComment,
    deleteComment,
    fetchMyComments,
    deletePost
  }), [authUser]);

  return (
    <GlobalContext.Provider value={ value }>
      {children}
    </GlobalContext.Provider>
  );
}

export default GlobalProvider;