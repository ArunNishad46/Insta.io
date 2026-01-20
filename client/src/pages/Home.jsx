import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import SkeletonLoader from "../components/SkeletonLoader";

export default function Home() {
  const { fetchAllPosts } = useGlobalContext();
  const { allPosts, loading } = useSelector(s => s.post);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 mt-3">
        {[...Array(2)].map((_, i) => (
          <SkeletonLoader key={i} className="h-96 w-150 rounded" />
        ))}
      </div>
    );
  }

  if (!allPosts || allPosts.length === 0) {
    return (
      <div className="p-6 text-lg text-center text-gray-600">
        No posts yet.
        <div className="mt-2">
          <Link to="/create-post" className="text-purple-600 font-medium underline">
            Create your first post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-10 max-w-xl mx-auto space-y-4">
      {allPosts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
