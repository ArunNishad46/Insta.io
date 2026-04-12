import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { setFeedPosts, setLoading as setPostLoading } from "../store/postSlice";

export default function FollowingPost() {
  const { fetchFeedPosts } = useGlobalContext();
  const { feedPosts, loading } = useSelector(s => s.post);
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = async () => {
    if (!hasMore) return;

    if (page === 1) {
      dispatch(setPostLoading(true));
    } else {
      setLoadingMore(true);
    }

    const data = await fetchFeedPosts(page);
    
    if(page === 1) {
      dispatch(setFeedPosts(data.posts));
    } else {
      dispatch(setFeedPosts([...feedPosts, ...data.posts]));
    }
    setHasMore(data.hasMore);
    dispatch(setPostLoading(false));
    setLoadingMore(false);
  };


  useEffect(() => {
    loadPosts();
  }, [page]);

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

        {hasMore && (
          <div className="flex justify-center">
            <button onClick={() => setPage(prev => prev + 1)} className={`px-4 py-2 ${loadingMore ? "text-purple-600 text-lg font-semibold" : "bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"}`}>
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
