import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { setAllPosts, setLoading as setPostLoading } from "../store/postSlice";

export default function Home() {
  const { fetchAllPosts } = useGlobalContext();
  const { allPosts, loading } = useSelector(s => s.post);
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

    const data = await fetchAllPosts(page);
    
    if(page === 1) {
      dispatch(setAllPosts(data.posts));
    } else {
      dispatch(setAllPosts([...allPosts, ...data.posts]));
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

      {hasMore && (
        <div className="flex justify-center">
          <button onClick={() => setPage(prev => prev + 1)} className={`px-4 py-2 ${loadingMore ? "text-purple-600 text-lg font-semibold" : "bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"}`}>
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
