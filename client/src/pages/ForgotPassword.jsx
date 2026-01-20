import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import logo from '../assets/logo.png';
import {AiOutlineLoading3Quarters} from "react-icons/ai";

export default function ForgotPassword() {
  const { forgotPassword } = useGlobalContext();
  const { loading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await forgotPassword(email);
    if(ok){
      setEmail("")
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl px-10 py-8 flex flex-col items-center mt-20">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
          <div className='flex flex-col items-center'>
            <img src={logo} alt="logo" className="w-15 mb-1" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
            <p className="text-gray-600 text-center text-sm mb-4">
              Enter your registered email and we will send you a password reset link.
            </p>
          </div>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:ring focus:ring-purple-400"
          /> 

          <button
            type="submit"
            className="mt-2 bg-linear-to-r from-purple-700 to-orange-500 text-white font-semibold py-2 rounded-md transition cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <AiOutlineLoading3Quarters className="animate-spin text-white" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
