import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import SkeletonLoader from "../components/SkeletonLoader";

export default function FollowingPost() {
  const { fetchFeedPosts } = useGlobalContext();
  const { feedPosts, loading } = useSelector(s => s.post);

  useEffect(() => {
    fetchFeedPosts();
  }, [fetchFeedPosts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 mt-3">
        {[...Array(2)].map((_, i) => (
          <SkeletonLoader key={i} className="h-96 w-150 rounded" />
        ))}
      </div>
    )
  }

  if (!feedPosts || feedPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-600 text-lg">No feed posts yet.</p>
        <Link to="/create-post" className="mt-2 text-purple-600 underline font-medium">
          Create your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto py-4 space-y-4">
        {feedPosts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
