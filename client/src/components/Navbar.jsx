import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoSearchOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { BiSolidUserPin } from "react-icons/bi";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import Axios from "../api/axiosApi";
import summaryApi from "../api/summaryApi";
import UserDropdown from "./UserDropdown";
import logo from "../assets/logo.png";
import avatar from "../assets/avatar.png";
import SkeletonLoader from "./SkeletonLoader";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path;

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const searchRef = useRef(null);
  const buttonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowSearch(false);
        setSearch("");
        setResults([]);
      }
    };
    if (showSearch || results.length > 0) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch, results]);

  // Focus input when opening mobile search
  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

  // Search API
  useEffect(() => {
    if (!search.trim()) {
      setLoading(false);
      setResults([]);
      return;
    }

    setLoading(true);
    const fetchResults = async () => {
      try {
        const { data } = await Axios(summaryApi.searchUsers(search));
        setResults(data || []);
      } catch (err) {
        setResults([]);
        toast.error(err.data.message);
      }finally{
        setLoading(false);
      }
    };

    const t = setTimeout(fetchResults, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleUserSelect = (username) => {
    navigate(username === user?.username ? "/me" : `/user/${username}`);
    setSearch("");
    setResults([]);
    setShowSearch(false);
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-white shadow fixed top-0 w-full z-50">
      <Link to={isAuthenticated ? "/" : "/login"}>
        <img src={logo} className="h-9 md:h-10 cursor-pointer" alt="logo" />
      </Link>

      {/* Desktop SEARCH */}
      {isAuthenticated && (
        <div ref={searchRef} className="hidden sm:flex flex-1 max-w-xl mx-4 relative">
          <div className="relative w-full border border-purple-300 focus-within:border-purple-500 rounded-full overflow-hidden shadow-sm">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 pl-10 pr-4 py-1.5 outline-none w-full text-sm sm:text-base text-gray-700"
            />
          </div>

          {search.trim() && loading && (
            <div className="absolute top-full mt-1 w-full bg-white border border-purple-300 border-t-2 border-t-purple-400 p-2 text-sm text-gray-500 text-center z-10 rounded-md">
              <div className="flex flex-col items-center justify-center space-y-1">
                {[...Array(3)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            </div>
          )}
        
          {search.trim() && !loading && results.length > 0 && (
            <div className="absolute top-full mt-1 w-full border border-purple-300 border-t-2 border-t-purple-400 bg-white rounded-md shadow-md max-h-80 overflow-y-auto z-50">
              {results.map((u) => (
                <div key={u._id} className="flex flex-col">
                  <button
                    onClick={() => handleUserSelect(u.username)}
                    className="flex items-center px-4 py-2 hover:bg-purple-200 cursor-pointer"
                  >
                    <img
                      src={u.profileImage || avatar}
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                    <div className="flex flex-col items-start">
                      <p className="text-sm text-gray-800 font-semibold">{u.username}</p>
                      <p className="text-xs text-gray-600">{u.fullname}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

          {search.trim() && !loading && search && results.length === 0 && (
            <div className="absolute top-full mt-1 w-full bg-white text-gray-500 border border-purple-300 border-t-2 border-t-purple-400 text-sm p-2 rounded shadow text-center z-10">
              No users found!
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* Mobile Search Toggle */}
            <button
              ref={buttonRef}
              title="Search"
              onClick={() => setShowSearch(!showSearch)}
              className={`sm:hidden p-1.5 rounded-full transition cursor-pointer
                ${showSearch
                  ? "bg-purple-400 text-white"
                  : "bg-purple-200 text-gray-700 hover:bg-purple-400 hover:text-white"
                }`
              }
            >
              <IoSearchOutline className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <Link
              to="/following-posts"
              className={`flex items-center justify-center gap-2 font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition text-sm sm:text-base
                ${isActive("/following-posts")
                  ? `${dropdownOpen || showSearch ? "text-gray-700 bg-purple-200" : "bg-purple-400 text-white"}`
                  : "text-gray-700 bg-purple-200 hover:bg-purple-400 hover:text-white"
                }`
              }
            >
              <BiSolidUserPin className="w-5 h-5" />
              <span className="hidden md:block">My Feed</span>
            </Link>

            <Link
              to="/create-post"
              className={`flex items-center justify-center gap-2 font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition text-sm sm:text-base
                ${isActive("/create-post")
                  ? `${dropdownOpen || showSearch ? "text-gray-700 bg-purple-200" : "bg-purple-400 text-white"}`
                  : "text-gray-700 bg-purple-200 hover:bg-purple-400 hover:text-white"
                }`
              }
            >
              <FaPlus className="h-5 w-5" />
              <span className="hidden md:block">Create</span>
            </Link>

            {/* USER DROPDOWN */}
            <div className="relative">
              <div 
                ref={profileButtonRef}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center justify-center gap-2 font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition text-sm sm:text-base cursor-pointer
                  ${dropdownOpen
                    ? "bg-purple-400 text-white"
                    : "text-gray-700 bg-purple-200 hover:bg-purple-400 hover:text-white"
                  }`
                }
              >
                <img
                  src={user?.profileImage || avatar}
                  title="Profile"
                  alt="avatar"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="hidden md:block">Profile</span>
              </div>

              <UserDropdown
                user={user}
                open={dropdownOpen}
                onClose={() => setDropdownOpen(false)}
                buttonRef={profileButtonRef}
              />
            </div>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="text-white bg-linear-to-r from-purple-700 to-orange-500 px-3 py-1 rounded-md"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="text-white bg-linear-to-r from-purple-700 to-orange-500 px-3 py-1 rounded-md"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* MOBILE SEARCH DROPDOWN */}
      {isAuthenticated && showSearch && (
        <div
          ref={searchRef}
          className="absolute top-full left-0 w-full bg-white px-4 py-2 shadow-md sm:hidden"
        >
          <div className="relative w-full">
            <div className="relative w-full border border-purple-300 rounded-full overflow-hidden shadow-sm">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                ref={inputRef}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 w-full pl-10 pr-4 py-2 outline-none text-sm text-gray-600"
              />
            </div>
  
            {search.trim() && loading && (
              <div className="absolute top-full mt-1 w-full bg-white p-2 text-sm text-gray-500 border border-purple-300 border-t-2 border-t-purple-400 text-center rounded-md shadow-md z-10">
                <div className="flex flex-col items-center justify-center space-y-1">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonLoader key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              </div>
            )}
  
            {search.trim() && !loading && results.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-purple-300 border-t-2 border-t-purple-400 rounded-md shadow-md z-10">
                {results.map((u) => (
                  <div key={u._id} className="flex flex-col">
                    <button
                      onClick={() => handleUserSelect(u.username)}
                      className="flex items-center px-4 py-2 hover:bg-purple-200 cursor-pointer"
                    >
                      <img
                        src={u.profileImage || avatar}
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                      <div className="flex flex-col items-start">
                        <p className="font-semibold text-gray-800 text-sm">{u.username}</p>
                        <p className="text-xs text-gray-600">{u.fullname}</p>
                      </div>
                    </button>
                  </div>
                  ))}
              </div>
            )}
  
            {search.trim() && !loading && search && results.length === 0 && (
              <div className="absolute top-full mt-1 w-full bg-white text-gray-500 border border-purple-300 border-t-2 border-t-purple-400 rounded-md shadow-md text-sm p-2 text-center z-10">
                No users found!
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
