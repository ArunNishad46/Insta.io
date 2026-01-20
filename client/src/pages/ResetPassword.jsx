import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import logo from "../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useGlobalContext();
  const { loading } = useSelector((state) => state.auth);

  const [show, setShow] = useState({
    newPassword: false,
    confirmPassword: false
  })
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await resetPassword(token, { newPassword, confirmPassword });
    if(ok){
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login");
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl px-10 py-8 flex flex-col items-center mt-20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='flex flex-col items-center'>
            <img src={logo} alt="logo" className="w-15 mb-1" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-600 text-center text-sm mb-4">Reset your password by entering a new one below and confirm to continue.</p>
          </div>

          <div className="flex flex-col relative">
            <input
              type={show.newPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:ring focus:ring-purple-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShow({ ...show, newPassword: !show.newPassword })}
                className="absolute right-3 top-4 text-gray-500 cursor-pointer"
              >
                {show.newPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>
          
          <div className="flex flex-col relative">
            <input
              type={show.confirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:ring focus:ring-purple-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShow({ ...show, confirmPassword: !show.confirmPassword })}
                className="absolute right-3 top-4 text-gray-500 cursor-pointer"
              >
                {show.confirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-linear-to-r from-purple-700 to-orange-500 rounded-md transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <AiOutlineLoading3Quarters className="animate-spin text-white" />
                <span>Resetting...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
