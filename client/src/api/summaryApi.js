const summaryApi = {
  // AUTH API
  register: {
    url: '/api/auth/signup',
    method: 'post',
  },
  login: {
    url: '/api/auth/login',
    method: 'post',
  },
  logout: {
    url: '/api/auth/logout',
    method: 'post',
  },
  refreshToken: {
    url: '/api/auth/refresh-token',
    method: 'post',
  },
  forgotPassword: {
    url: '/api/auth/forgot-password',
    method: 'post',
  },
  resetPassword: (token) => ({
    url: `/api/auth/reset-password/${token}`,
    method: 'post',
  }),

  // USER API
  myProfile: {
    url: '/api/user/me',
    method: 'get',
  },
  updateProfileImage: { 
    url: "/api/user/me/profile-image", 
    method: "put",
  },
  deleteProfileImage: {
    url: "/api/user/me/profile-image",
    method: "delete",
  },
  updateProfileDetails: { 
    url: "/api/user/me/update-details", 
    method: "put",
  },
  changePassword: { 
    url: "/api/user/me/change-password", 
    method: "put" 
  },
  deleteAccount: { 
    url: "/api/user/me/delete-account", 
    method: "delete" 
  },
  publicProfile: (username) => ({
    url: `/api/user/profile/${username}`,
    method: "get",
  }),
  searchUsers: (query) => ({ 
    url: `/api/user/search-users?query=${query}`, 
    method: "get" 
  }),
  followUser: (id) => ({ 
    url: `/api/user/follow/${id}`, 
    method: "post" 
  }),
  unfollowUser: (id) => ({ 
    url: `/api/user/unfollow/${id}`, 
    method: "post" 
  }),
  getFollowers: (id) => ({ 
    url: `/api/user/${id}/followers`, 
    method: "get"
  }),
  getFollowing: (id) => ({ 
    url: `/api/user/${id}/following`, 
    method: "get" 
  }),

  // POST API
  createPost: { 
    url: "/api/post/create-post", 
    method: "post" 
  },
  getAllPosts: { 
    url: "/api/post/all-posts", 
    method: "get" 
  },
  getMyPost: {
    url: "/api/post/my-posts",
    method: "get",
  },
  getMyFeedPosts: { 
    url: "/api/post/my-feed-posts", 
    method: "get" 
  },
  userPosts: (id) => ({ 
    url: `/api/post/user-posts/${id}`, 
    method: "get" 
  }),
  toggleLike: (id) => ({ 
    url: `/api/post/like-toggle/${id}`, 
    method: "put" 
  }),
  getLikedPosts: { 
    url: "/api/post/liked-posts", 
    method: "get"
  },
  toggleSave: (id) => ({ 
    url: `/api/post/save-toggle/${id}`, 
    method: "put" 
  }),
  getSavedPosts: { 
    url: "/api/post/saved-posts", 
    method: "get"
  },
  addComment: (id) => ({ 
    url: `/api/post/add-comment/${id}`, 
    method: "post" 
  }),
  getComments: (id) => ({ 
    url: `/api/post/comments/${id}`, 
    method: "get" 
  }),
  getMyComments: { 
    url: "/api/post/my-comments", 
    method: "get" 
  },
  deleteComment: (pId, cId) => ({
    url: `/api/post/delete-comment/${pId}/${cId}`,
    method: "delete",
  }),
  deletePost: (id) => ({ 
    url: `/api/post/delete-post/${id}`, 
    method: "delete" 
  }),
};

export default summaryApi;