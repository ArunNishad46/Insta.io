import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PostCard from "../components/PostCard";
import { RxCross2 } from "react-icons/rx";

export default function PostPreview() {
  const { type } = useParams();
  const navigate = useNavigate();

  const { profilePosts, likedPosts, savedPosts, loading } = useSelector(s => s.post);

  const map = {
    profile: profilePosts,
    liked: likedPosts,
    saved: savedPosts,
  };

  const list = map[type] || [];

  const titleMap = {
    profile: "Posts",
    liked: "Liked Posts",
    saved: "Saved Posts"
  };

  const username = list?.[0]?.postedBy?.username || "Unknown";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-12">
      <div className="sticky top-0 bg-white shadow z-50 flex items-center justify-between px-4 py-3.5">
        <button onClick={() => navigate(-1)} className="text-2xl hover:text-purple-600 cursor-pointer"><RxCross2 /></button>
        <h2 className="flex items-center gap-2 text-lg font-semibold">{username}'s {titleMap[type]}</h2>
        <span className="w-6" />
      </div>

      {loading && (
        <div className="p-4 text-center">Loading...</div>
      )}

      {!loading && list.length === 0 && (
        <div className="p-6 text-center text-gray-600 text-md">
          No {titleMap[type].toLowerCase()} found.
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="pt-4 pb-10 max-w-xl mx-auto space-y-4">
          {list.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
