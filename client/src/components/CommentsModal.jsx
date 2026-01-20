import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";
import avatar from "../assets/avatar.png";
import { RxCross2 } from "react-icons/rx";
import formatTimeAgo from "../utils/fomatTimeAgo";
import { IoTrash } from "react-icons/io5";
import SkeletonLoader from "./SkeletonLoader";

export default function CommentsModal({ post, onClose }) {
  const { addComment, fetchComments, deleteComment } = useGlobalContext();
  const { user: authUser } = useSelector(s => s.auth);

  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const sheetRef = useRef();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPadding = document.body.style.paddingRight;
  
    document.body.style.overflow = "hidden";
    document.body.style.paddingLeft = "0px";
  
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    };
  }, []);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    const data = await fetchComments(post._id);
    setComments([...data.comments].reverse());
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    const text = input;
    setInput("");
  
    const tempId = "temp_" + Math.random().toString(36);
    const optimisticComment = {
      _id: tempId,
      text,
      user: authUser,
      createdAt: new Date().toISOString()
    };
  
    setComments(prev => [optimisticComment, ...prev]);
    try{
      const res = await addComment(post._id, { text });

      if (res?.comment) {
        setComments(prev =>
          prev.map(c => (c._id === tempId ? res.comment : c))
        );
      }
    }catch(err){
      setComments(prev => prev.filter(c => c._id !== tempId));
    }
  };

  const handleDeleteComment = async (commentId) => {
    setComments(prev => prev.filter(c => c._id !== commentId));
    await deleteComment(post._id, commentId);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex justify-center items-end"
      onClick={handleOverlayClick}
    >
      <div
        ref={sheetRef}
        className="bg-white w-full max-w-xl max-h-[60vh] rounded-t-2xl flex flex-col animate-slideUp"
      >
        <div className="flex items-center justify-between py-3 px-4 border-b border-purple-400">
          <h2 className="text-base font-semibold">Comments</h2>
          <button onClick={onClose} className="text-lg cursor-pointer text-gray-500"><RxCross2 /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading && (
            <div className="space-y-2 mt-2">
              {[...Array(3)].map((_, i) => (
                <SkeletonLoader key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          )}

          {!loading && comments.length === 0 && (
            <p className="text-center text-gray-500 text-sm">No comments yet</p>
          )}

          {!loading && comments.map(c => {
            const userData = c.user;

            const isCommentOwner = authUser?._id === userData?._id;
            const isPostOwner = authUser?._id === post?.postedBy?._id;
            const canDelete = isCommentOwner || isPostOwner;
          
            return (
              <div key={c._id} className="flex gap-3 items-start">
                <Link 
                  to={userData?.username === authUser?.username ? "/me" : `/user/${userData?.username}`}
                  onClick={onClose}
                >
                  <img
                    src={userData?.profileImage || avatar}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
          
                <div className="flex-1">
                  <p className="text-sm flex items-center">
                    <Link 
                      to={userData?.username === authUser?.username ? "/me" : `/user/${userData?.username}`}
                      onClick={onClose} 
                      className="font-semibold mr-2 hover:text-purple-600"
                    >
                      @{userData?.username}
                    </Link>
                    <span className="text-xs text-gray-500">{formatTimeAgo(c.createdAt)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {c.text}
                  </p>
                </div>
          
                {canDelete && c._id.length === 24 && (
                  <button
                    onClick={() => handleDeleteComment(c._id)}
                    className="text-lg text-red-500 cursor-pointer"
                  >
                    <IoTrash />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAddComment} className="border-t border-purple-400 p-3 flex gap-3">
          <input
            className="flex-1 border border-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-400"
            placeholder="Add a comment..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="bg-purple-600 text-white text-sm px-3 rounded cursor-pointer">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
