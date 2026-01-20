import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setPublicProfile, updateFollowersCount,
updateFollowingCount } from "../store/userSlice";
import { useGlobalContext } from "../context/GlobalContext";

import SkeletonLoader from "../components/SkeletonLoader";
import PostGrid from "../components/PostGrid";
import MyComments from "../components/MyComments";
import avatar from "../assets/avatar.png";
import { FaRegImage } from "react-icons/fa6";
import { SlLike } from "react-icons/sl";
import { MdInsertComment } from "react-icons/md";
import { FaBookmark } from "react-icons/fa6";
import { MdSettings } from "react-icons/md";
import { FaLock } from "react-icons/fa";

export default function Profile({ isSelf = false }) {
  const navigate = useNavigate();
  const { username } = useParams();
  const postsRef = useRef(null);
  const dispatch = useDispatch();
  
  const {
    fetchMyProfile,
    fetchPublicProfile,
    fetchProfilePosts,
    fetchLikedPosts,
    fetchSavedPosts,
    fetchMyComments,
    followUser,
    unfollowUser
  } = useGlobalContext();

  const { myProfile, publicProfile } = useSelector((s) => s.user);
  const { user: authUser } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [hover, setHover] = useState(false);

  const profile = isSelf ? myProfile : publicProfile;

  useEffect(() => {
    setActiveTab("posts");
  }, [username]);

  useEffect(() => {
    if (isSelf) fetchMyProfile();
    else fetchPublicProfile(username);
  }, [isSelf, username]);

  useEffect(() => {
    if (!isSelf && profile && authUser) {
      setIsFollowing(profile.isFollowing);
    }
  }, [profile, authUser, isSelf]);

  const isPrivate = profile?.isPrivate;
  const iFollowThem = profile?.isFollowing;   
  const theyFollowMe = profile?.followsMe;

  const canView = isSelf || !isPrivate || (iFollowThem && theyFollowMe);

  // LOAD TAB CONTENT
  useEffect(() => {
    if (!profile?._id || !canView) return;

    if (activeTab === "posts") fetchProfilePosts(profile._id);
    if (activeTab === "liked" && isSelf) fetchLikedPosts();
    if (activeTab === "saved" && isSelf) fetchSavedPosts();
    if (activeTab === "comments" && isSelf) fetchMyComments();
  }, [profile, profile?._id, canView, activeTab, isSelf]);

  const handleFollowToggle = async () => {
    if (!profile?._id) return;

    const currentlyFollowing = isFollowing;
    setIsFollowing(!currentlyFollowing);

    let updatedProfile = { ...profile };

    if (currentlyFollowing) {
      updatedProfile.followersCount = (updatedProfile.followersCount || 1) - 1;
      updatedProfile.isFollowing = false;
      dispatch(setPublicProfile(updatedProfile));

      const res = await unfollowUser(profile._id);
      dispatch(updateFollowersCount({ userId: profile._id, count: res.followersCount }));
      dispatch(updateFollowingCount({ userId: authUser._id, count: res.followingCount }));

    } else {
      updatedProfile.followersCount = (updatedProfile.followersCount || 0) + 1;
      updatedProfile.isFollowing = true;
      dispatch(setPublicProfile(updatedProfile));

      const res = await followUser(profile._id);
      dispatch(updateFollowersCount({ userId: profile._id, count: res.followersCount }));
      dispatch(updateFollowingCount({ userId: authUser._id, count: res.followingCount }));
    }
  };

  if (!profile?._id) {
    return (
      <div className="min-h-screen bg-gray-100 pb-10">
        <div className="max-w-3xl mx-auto p-4 py-6 space-y-4">
  
          {/* Avatar + Name row */}
          <div className="flex items-center gap-6">
            <SkeletonLoader className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader className="h-5 w-40" />  {/* Name */}
              <SkeletonLoader className="h-4 w-28" />  {/* @username */}
              <div className="flex gap-4">
                <SkeletonLoader className="h-4 w-16" /> {/* Posts */}
                <SkeletonLoader className="h-4 w-20" /> {/* Followers */}
                <SkeletonLoader className="h-4 w-20" /> {/* Following */}
              </div>
            </div>
          </div>
  
          {/* Bio */}
          <SkeletonLoader className="h-4 w-2/3" />
  
          {/* Divider */}
          <SkeletonLoader className="h-0.5 w-full mt-2" />
  
          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <SkeletonLoader className="h-8 w-24 rounded" />
            <SkeletonLoader className="h-8 w-24 rounded" />
            <SkeletonLoader className="h-8 w-24 rounded" />
            <SkeletonLoader className="h-8 w-24 rounded" />
          </div>
        </div>
      </div>
    )
  }

  const tabs = isSelf
    ? [
        { key: "posts", label: "My Posts", icon: <FaRegImage /> },
        { key: "liked", label: "Liked Posts", icon: <SlLike /> },
        { key: "saved", label: "Saved Posts", icon: <FaBookmark /> },
        { key: "comments", label: "My Comments", icon: <MdInsertComment /> },
      ]
    : [{ key: "posts", label: "Posts", title: "My Posts", icon: <FaRegImage /> }];

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="max-w-3xl mx-auto p-4 py-6">
        <div className="flex items-center gap-6">
          <img
            src={profile.profileImage || avatar}
            alt="profile"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex items-center sm:gap-30 gap-16">
              <h2 className="text-xl font-semibold">{profile.fullname}</h2>

              {isSelf && (
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-1 px-4 py-1 text-sm rounded bg-purple-500 text-white cursor-pointer"
                >
                  <MdSettings /> Settings
                </button>
              )}

              {!isSelf && (
                <button
                  onClick={handleFollowToggle}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  className={`px-3 py-1 rounded text-sm cursor-pointer ${
                    !isFollowing && !profile.followsMe 
                      ? "bg-purple-500 text-white px-4"           
                      : !isFollowing && profile.followsMe 
                      ? "bg-purple-500 text-white"         
                      : hover 
                      ? "bg-purple-500 text-white"            
                      : "bg-gray-300 text-gray-800"           
                  }`}
                >
                  {
                    !isFollowing && !profile.followsMe
                      ? "Follow"
                      : !isFollowing && profile.followsMe
                      ? "Follow back"
                      : hover
                      ? "Unfollow"
                      : "Following"
                  }
                </button>
              )}
            </div>

            <p className="text-gray-600">@{profile.username}</p>

            <div className="flex gap-6 text-sm mt-3">
              {(isSelf || !isPrivate || (iFollowThem && theyFollowMe)) ? (
                <span 
                  onClick={() => {
                    setActiveTab("posts");
                    setTimeout(() => {
                      postsRef.current?.scrollIntoView({ behavior: "smooth",  });
                    }, 100);
                  }}
                  className="flex flex-col items-center sm:flex sm:flex-row sm:gap-2 hover:text-purple-700 cursor-pointer"
                >
                  <strong>{profile.postsCount || 0}</strong> Posts
                </span>
              ) : (
                <span
                className="flex flex-col items-center sm:flex sm:flex-row sm:gap-2"
                >
                  <strong>{profile.postsCount || 0}</strong> Posts
                </span>
              )}

              {(isSelf || !isPrivate || (iFollowThem && theyFollowMe)) ? (
                <Link 
                  to={isSelf ? "/me/followers" : `/user/${profile.username}/followers`}
                  className="flex flex-col items-center sm:flex sm:flex-row sm:gap-2 hover:text-purple-700"
                >
                  <strong>{profile.followersCount || 0}</strong> Followers
                </Link>
              ) : (
                <span className="flex flex-col items-center sm:flex sm:flex-row sm:gap-2">
                  <strong>{profile.followersCount || 0}</strong> Followers
                </span>
              )}

              {(isSelf || !isPrivate || (iFollowThem && theyFollowMe)) ? (
                <Link 
                  to={isSelf ? "/me/following" : `/user/${profile.username}/following`}
                  className="flex flex-col items-center sm:flex sm:flex-row sm:gap-2 hover:text-purple-700"
                >
                  <strong>{profile.followingCount || 0}</strong> Following
                </Link>
              ) : (
                <span className="flex flex-col items-center sm:flex sm:flex-row sm:gap-2">
                  <strong>{profile.followingCount || 0}</strong> Following
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 py-2">
          <span className="text-gray-600">{profile.bio}</span>
        </div>

        {!canView && (
          <div className="flex flex-col mt-4 items-center text-gray-600 border-t border-purple-300">
            <FaLock size={20} className="mt-10" />
            <p>
              This account is private.
            </p>
            {iFollowThem && !theyFollowMe && (
              <p>Waiting for them to follow you back to view posts.</p>
            )}
            {!iFollowThem && (
              <p>Follow and wait for a follow back to see their posts.</p>
            )}
          </div>
        )}

        {canView && (
          <>
            <div className="flex gap-2 mt-6 border-t border-purple-300 pt-4 overflow-x-auto scrollbar-hide whitespace-nowrap sm:overflow-visible">
              {tabs.map((t) => (
                <span
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1 text-md px-3 py-2 mb-2 text-sm font-medium transition rounded-md cursor-pointer ${activeTab === t.key ? "bg-purple-200 text-purple-700" : "text-gray-600 hover:bg-gray-200"}`}
                >
                  {t.icon}{t.label}
                </span>
              ))}
            </div>

            <div ref={postsRef} className="mt-6">
              {activeTab === "posts" && <PostGrid type="profile" />}
              {activeTab === "liked" && isSelf && <PostGrid type="liked" />}
              {activeTab === "saved" && isSelf && <PostGrid type="saved" />}
              {activeTab === "comments" && isSelf && <MyComments />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
