import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../context/GlobalContext";
import { FaUser } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import avatar from "../assets/avatar.png";

export default function UserDropdown({ user, open, onClose, buttonRef }) {
  const dropdownRef = useRef(null);

  const { logout } = useGlobalContext();

  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) && 
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-auto bg-white shadow-2xl rounded-md border border-purple-300 z-50"
    >
      <div className="flex px-2 py-2 border-b border-purple-300 bg-purple-500">
        <img
          src={user.profileImage || avatar}
          alt="profile"
          className="w-8 h-8 rounded-full object-cover mr-3"
        />
        <div>
          <p className="text-white text-sm font-bold">{user.fullname}</p>
          <p className="text-white text-sm font-semibold mr-8">{user.email}</p>
        </div>
      </div>
      <Link
        to="/me"
        onClick={onClose}
        className="block px-4 py-2 text-sm hover:bg-purple-200 cursor-pointer"
      >
        <FaUser className="inline mr-2" />
        View Profile
      </Link>

      <Link
        to="/settings"
        onClick={onClose}
        className="block px-4 py-2 text-sm hover:bg-purple-200 cursor-pointer"
      >
        <IoSettingsSharp className="inline mr-2" />
        Settings
      </Link>

      <button
        onClick={() => {
          logout();
          onClose();
        }}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-200 text-red-600 cursor-pointer"
      >
        <MdLogout className="inline mr-2" />
        Logout
      </button>
    </div>
  );
}
