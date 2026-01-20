import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SkeletonLoader from "./SkeletonLoader";
import { FaPlay } from "react-icons/fa";

export default function PostGrid({ type = "profile" }) {
  const navigate = useNavigate();
  const { profilePosts, likedPosts, savedPosts, loading } = useSelector((s) => s.post);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (type === "profile") setPosts(profilePosts || []);
    if (type === "liked") setPosts(likedPosts || []);
    if (type === "saved") setPosts(savedPosts || []);
  }, [profilePosts, likedPosts, savedPosts, type]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[...Array(9)].map((_, i) => (
          <SkeletonLoader key={i} className="aspect-square rounded" />
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center text-gray-500 p-6">
        {type === "profile" && "No posts yet"}
        {type === "liked" && "No liked posts yet"}
        {type === "saved" && "No saved posts yet"}
      </div>
    );
  }

  const handleOpenPreview = () => {
    navigate(`/post-preview/${type}`);
  };

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-4">
      {posts.map((p) => (
        <PostThumb key={p._id} post={p} onClick={() => handleOpenPreview()} />
      ))}
    </div>
  );
}

function PostThumb({ post, onClick }) {
  const firstMedia = post.media?.[0];
  const isVideo = firstMedia?.type === "video";
  const hasMultiple = post.media?.length > 1;

  return (
    <div 
      onClick={onClick}
      className="relative aspect-square overflow-hidden rounded bg-gray-200 group cursor-pointer"
    >
      {firstMedia && (
        isVideo ? (
          <video
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
            src={firstMedia.url}
            muted
            preload="metadata"
          />
        ) : (
          <img
            src={firstMedia.url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            alt=""
          />
        )
      )}

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 text-white text-xs p-1 rounded-full">
            <FaPlay />
          </div>
        </div>
      )}

      {hasMultiple && (
        <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
          +{post.media.length - 1}
        </div>
      )}
    </div>
  );
}
