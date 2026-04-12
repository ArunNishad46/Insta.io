import React, { useEffect, useState } from 'react';
import { useGlobalContext, } from '../context/GlobalContext';
import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom';
import { removeFromFeed, removePost } from "../store/postSlice";
import { updateFollowersCount, updateFollowingCount } from "../store/userSlice";
import { FiHeart, FiBookmark } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { BsFillBookmarkFill } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import avatar from "../assets/avatar.png";
import { IoTrash } from "react-icons/io5";

import formatTimeAgo from "../utils/fomatTimeAgo";
import FadeIn from './FadeIn';
import CommentsModal from './CommentsModal';
import InstaVideo from './InstaVideo';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PostCard = ({ post }) => {
  const { toggleLike, toggleSave, followUser, unfollowUser, deletePost } = useGlobalContext();
  const authUser = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const userData = post.postedBy;

  const [likeLoading, setLikeLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const [isLiked, setIsLiked] = useState(!!post.isLikedByMe);
  const [likes, setLikes] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSavedByMe);
  const [showComments, setShowComments] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSelfPost = authUser?._id === post.postedBy._id;

  const [isFollowing, setIsFollowing] = useState(post.isFollowingByMe ?? false);

  const handleFollowToggle = async () => {
    setIsFollowing(!isFollowing); 

    if (isFollowing) {
      const res = await unfollowUser(post.postedBy._id);
      dispatch(updateFollowersCount({ userId: post.postedBy._id, count: res.followersCount }));
      dispatch(updateFollowingCount({ userId: authUser._id, count: res.followingCount }));

      dispatch(removeFromFeed(post.postedBy._id));
    } else {
      const res = await followUser(post.postedBy._id);
      dispatch(updateFollowersCount({ userId: post.postedBy._id, count: res.followersCount }));
      dispatch(updateFollowingCount({ userId: authUser._id, count: res.followingCount }));
    }
  };

  const confirmDelete = async () => {
    try {
      await deletePost(post._id);
      dispatch(removePost(post._id));
      setShowDeleteModal(false);
    } catch (err) {
      setShowDeleteModal(false);
    }
  };

  const handleLike = async () => {
    if (likeLoading) return; 
    
    const prevLiked = isLiked;
    
    setIsLiked(!prevLiked);
    setLikes(likes + (prevLiked ? -1 : 1));
    
    setLikeLoading(true);
    try {
      await toggleLike(post._id);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikes(likes);
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    setIsLiked(!!post.isLikedByMe);
    setLikes(post.likesCount);
  }, [post.isLikedByMe, post.likesCount])

  const handleSave = async () => {
    setIsSaved(!isSaved);
    await toggleSave(post._id);
  };

  return (
    <FadeIn>
      <div className="bg-white rounded-md shadow overflow-hidden">

        <div className='flex items-center justify-between'>
          <div className="flex items-center px-3 py-2 space-x-3">
            <Link to={userData?.username === authUser?.username ? "/me" : `/user/${userData?.username}`}>
              <img
                src={post?.postedBy?.profileImage || avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
            <div>
              <Link to={userData?.username === authUser?.username ? "/me" : `/user/${userData?.username}`} className="font-medium hover:text-purple-700">@{post?.postedBy?.username}</Link>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>
  
          {!isSelfPost && (
            <button
              onClick={handleFollowToggle}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              className={`px-3 py-1 rounded text-sm cursor-pointer mr-4 ${
                !isFollowing && !post.followsMe
                  ? "bg-purple-500 text-white"
                  : !isFollowing && post.followsMe
                  ? "bg-purple-500 text-white"
                  : hover
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {
                !isFollowing && !post.followsMe
                  ? "Follow"
                  : !isFollowing && post.followsMe
                  ? "Follow Back"
                  : hover
                  ? "Unfollow"
                  : "Following"
              }
            </button>
          )}

          {isSelfPost && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm text-red-500 px-3 py-1 hover:text-red-600 cursor-pointer"
            >
              <IoTrash size={20} />
            </button>
          )}
        </div>

        <div className="relative w-full max-h-150 bg-white">
          {post.media.length > 1 && (
            <div className="absolute top-2 right-2 bg-black opacity-60 text-white text-xs px-2 py-1 rounded-full z-10">
              {currentSlide + 1}/{post.media.length}
            </div>
          )}
        
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={post.media.length > 1}
            pagination={post.media.length > 1 ? { clickable: true } : false}
            onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
            className="max-h-150"
          >
            {post.media.map((m, i) => (
              <SwiperSlide key={i}>
                {m.type === "video" ? (
                  <InstaVideo src={m.url} />
                ) : (
                  <img
                    src={m.url}
                    alt="post"
                    className="w-full max-h-full object-cover"
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex justify-between items-center px-3 py-2">
          <div className="flex items-center gap-8">
            <button onClick={handleLike} className='cursor-pointer'>
              {isLiked ? (
                <AiFillHeart size={24} className="text-red-500" />
              ) : (
                <FiHeart size={24} />
              )}
            </button>
        
            <button className='cursor-pointer' onClick={() => setShowComments(true)}>
              <FaRegComment size={23} />
            </button>
          </div>
        
          <button className='cursor-pointer' onClick={handleSave}>
            {isSaved ? <BsFillBookmarkFill size={24} /> : <FiBookmark size={24} />}
          </button>
        </div>
        
        <div className="px-3 pb-2 text-sm text-gray-700 flex gap-4">
          <span>{likes} likes</span>
          <span className="cursor-pointer" onClick={() => setShowComments(true)}>
            {post.commentsCount} comments
          </span>
        </div>
      </div>

      {showComments && (
        <CommentsModal
          post={post}
          onClose={() => setShowComments(false)}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-4 w-72 text-center shadow">
            <p className="font-semibold mb-2">Delete Post?</p>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this post?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 w-1/2 mr-1 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center justify-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-1/2 ml-1 cursor-pointer"
              >
                <IoTrash size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </FadeIn>
  );
}

export default React.memo(PostCard);