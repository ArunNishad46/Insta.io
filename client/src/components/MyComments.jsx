import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import SkeletonLoader from "./SkeletonLoader";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import formatTimeAgo from "../utils/fomatTimeAgo";
import { IoTrash } from "react-icons/io5";

export default function MyComments() {
  const { fetchMyComments, deleteComment } = useGlobalContext();
  const { myComments, loading } = useSelector(s => s.post);
  const { user: authUser } = useSelector(s => s.auth);

  const handleDeleteFromMyComments = async (comment) => {
    await deleteComment(comment.post._id, comment._id);
  };

  useEffect(() => {
    fetchMyComments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 mt-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonLoader key={i} className="h-16 w-full rounded" />
        ))}
      </div>
    );
  }

  if (!myComments?.length) {
    return <div className="text-center text-gray-500 p-6">No comments yet</div>;
  }

  return (
    <div className="space-y-3 mt-3">
      {myComments.map((c, i) => {
        const postData = c.post || {};
        const postUser = postData?.postedBy || {};
        const media = Array.isArray(postData.media) && postData.media.length ? postData.media[0] : null;
        const isVideo = media?.type === "video";

        return (
          <div key={i} className="flex gap-3 p-3 bg-white rounded-lg shadow-sm">

            {media ? (
              <Link to={`/post/${postData._id}`} className="shrink-0 relative">
                {isVideo ? (
                  <video
                    src={media.url}
                    className="w-20 h-20 rounded object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={media.url}
                    className="w-20 h-20 rounded object-cover"
                    alt="post media"
                  />
                )}
            
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="bg-black/60 text-white p-1 rounded-full text-xs"
                    >
                      <FaPlay size={15} />
                    </div>
                  </div>
                )}
              </Link>
            ) : (
              <div className="w-20 h-20 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                No Media
              </div>
            )}
          
            <div className="flex-1">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">"You:</span> {c.text}"
              </p>
          
              <p className="text-sm text-gray-500 mt-1">
                on{" "} <Link to={postUser?.username === authUser?.username ? "/me" : `/user/${postUser?.username}`} className="text-gray-700 font-medium hover:text-purple-600">
                  @{postUser.username || "unknown"}
                </Link>’s post
              </p>
          
              {postData.caption && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  <span className="font-semibold">"Post:</span> {postData.caption || "No caption"}"
                </p>
              )}
          
              <p className="text-xs text-gray-400 mt-1">
                {formatTimeAgo(c.createdAt)}
              </p>
            </div>
            <button
              onClick={() => handleDeleteFromMyComments(c)}
              className="text-red-500 text-lg cursor-pointer"
            >
              <IoTrash size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
