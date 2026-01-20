import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { setMyProfile, setPublicProfile } from "../store/userSlice";
import avatar from "../assets/avatar.png";
import { MdKeyboardBackspace } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import SkeletonLoader from "../components/SkeletonLoader";

export default function FollowPage({ tab, isSelf = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { username } = useParams();

  const {
    fetchPublicProfile,
    fetchMyProfile,
    fetchFollowers,
    fetchFollowing,
    followUser,
    unfollowUser
  } = useGlobalContext();

  const { user: authUser } = useSelector(s => s.auth);
  const { publicProfile, myProfile } = useSelector(s => s.user);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tab);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [hoverId, setHoverId] = useState(null);

  const profile = isSelf ? myProfile : publicProfile;

  useEffect(() => {
    const routeTab = location.pathname.includes("following") ? "following" : "followers";
    setActiveTab(routeTab);
  }, [location.pathname]);

  useEffect(() => {
    if (!isSelf) fetchPublicProfile(username);
    else fetchMyProfile();
  }, [username]);

  useEffect(() => {
    if (!profile?._id) return;
    setLoading(true);

    const loadData = async () => {
      const data = activeTab === "followers"
        ? await fetchFollowers(profile._id)
        : await fetchFollowing(profile._id);

      setList(data || []);
      setLoading(false);
    };

    loadData();
  }, [activeTab, profile]);

  const changeTab = (t) => {
    if (isSelf) navigate(`/me/${t}`);
    else navigate(`/user/${profile.username}/${t}`);
  };

  const filteredList = list.filter(u =>
    (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.fullname || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleFollowToggle = async (u) => {
    const iFollow = u.isFollowing;

    if (iFollow) {
      const res = await unfollowUser(u._id);

      dispatch(setMyProfile({
        ...myProfile,
        followingCount: res.followingCount
      }));

      if (!isSelf) {
        dispatch(setPublicProfile({
          ...publicProfile,
          followersCount: res.followersCount
        }));
      }

      setList(prev =>
        prev.map(item =>
          item._id === u._id ? { ...item, isFollowing: false } : item
        )
      );

    } else {
      const res = await followUser(u._id);

      dispatch(setMyProfile({
        ...myProfile,
        followingCount: res.followingCount
      }));

      if (!isSelf) {
        dispatch(setPublicProfile({
          ...publicProfile,
          followersCount: res.followersCount
        }));
      }

      setList(prev =>
        prev.map(item =>
          item._id === u._id ? { ...item, isFollowing: true } : item
        )
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {profile && (
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-purple-600 cursor-pointer"
          >
            <MdKeyboardBackspace size={30} />
          </button>
          <div>
            <p className="text-lg font-semibold">{profile.username}</p>
          </div>
        </div>
      )}

      <div className="flex border-b border-purple-400 mb-3">
        <button
          className={`flex-1 py-2 text-sm font-medium transition rounded-md cursor-pointer ${activeTab === "followers" ? "bg-purple-200 text-purple-700" : "text-gray-600 hover:bg-gray-200"}`}
          onClick={() => changeTab("followers")}
        >
          Followers
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition rounded-md cursor-pointer ${activeTab === "following" ? "bg-purple-200 text-purple-700" : "text-gray-600 hover:bg-gray-200"}`}
          onClick={() => changeTab("following")}
        >
          Following
        </button>
      </div>
      
      <div className="relative w-full border border-gray-300 focus-within:border-purple-500 overflow-hidden rounded-lg mb-4">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-1.5 outline-none w-full text-sm sm:text-base text-gray-700"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-1">
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <p className="text-center text-gray-500">No users found</p>
        ) : (
          filteredList.map((u) => {
            const isSelfUser = u._id === authUser._id;
            const iFollow = u.isFollowing;
            const theyFollowMe = u.followsMe;

            let buttonText = "Follow";

            if (iFollow && theyFollowMe) buttonText = hoverId === u._id ? "Unfollow" : "Following";
            else if (!iFollow && theyFollowMe) buttonText = "Follow Back";
            else buttonText = "Follow";

            const goToUser = () => {
              if (isSelfUser) navigate("/me");
              else navigate(`/user/${u.username}`);
            };

            return (
              <div key={u._id} className="flex items-center justify-between">
                <div
                  onClick={goToUser}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img src={u.profileImage || avatar} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium text-sm">@{u.username}</p>
                    <p className="text-xs text-gray-500">{u.fullname}</p>
                  </div>
                </div>

                {!isSelfUser && (
                  <button
                    onMouseEnter={() => setHoverId(u._id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => handleFollowToggle(u)}
                    className={`px-3 py-1 rounded text-sm cursor-pointer ${
                      iFollow
                        ? hoverId === u._id
                          ? "bg-purple-500 text-white"
                          : "bg-gray-300 text-black"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {buttonText}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
