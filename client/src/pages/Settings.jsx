import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";
import ChangePassword from "./ChangePassword";
import { FaUserCog, FaLock } from "react-icons/fa";

export default function Settings() {
  const { state } = useLocation();
  const [tab, setTab] = useState(state?.tab || "profile");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex gap-2 border-b border-purple-300 pb-2">
        <button
          onClick={() => setTab("profile")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
            tab === "profile"
              ? "bg-purple-100 text-purple-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaUserCog /> Profile Settings
        </button>

        <button
          onClick={() => setTab("password")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
            tab === "password"
              ? "bg-purple-100 text-purple-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaLock /> Change Password
        </button>
      </div>

      <div className="mt-6">
        {tab === "profile" ? <ProfileSettings /> : <ChangePassword />}
      </div>
    </div>
  )
}
