import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import logo from '../assets/logo.png';
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const { login } = useGlobalContext();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(formData);
    if(ok){
      setFormData({
        identifier: "",
        password: ""
      })
      navigate('/');
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl px-10 py-4 flex flex-col items-center mt-10">
        <form 
          onSubmit={handleSubmit} 
          className="w-full flex flex-col gap-2"
        >
          <div className='flex flex-col items-center'>
            <img src={logo} alt="logo" className="w-15 mb-1" />
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Log in to Instaio</h2>
          </div>
          <div className="flex flex-col">
            <label htmlFor="identifier" className="mb-1 text-sm font-medium text-gray-700">
              Username/Email
            </label>
            <input
              type="text"
              name="identifier"
              id="identifier"
              placeholder="Username or Email"
              value={formData.identifier}
              onChange={handleChange}
              className="px-4 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-400"
            />    
          </div>
          <div className="flex flex-col relative">
            <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={show ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-400"
            />
            {formData.password.length > 0 && (
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-8 text-gray-500 cursor-pointer"
              >
                {show ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>
          <button
            type="submit"
            className="mt-2 bg-linear-to-r from-purple-700 to-orange-500 text-white font-semibold py-2 rounded transition cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <AiOutlineLoading3Quarters className="animate-spin text-white" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Log in"
            )}
          </button>
        </form>
        <div className="flex flex-col items-center mt-6 space-y-4 text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-700 hover:underline font-medium">
              Sign Up
            </Link> 
          </p>
          <Link to="/forgot-password" className="text-purple-700 hover:underline font-medium">
            forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}

