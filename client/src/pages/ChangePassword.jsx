import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/GlobalContext";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function ChangePassword() {
  const { changePassword } = useGlobalContext();
  const loading = useSelector((state) => state.user.loading);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const formEmpty =
    !formData.currentPassword &&
    !formData.newPassword &&
    !formData.confirmPassword;

  const formInvalid =
    !formData.currentPassword ||
    !formData.newPassword ||
    !formData.confirmPassword ||
    formData.newPassword !== formData.confirmPassword;

  const handleFormChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formInvalid) {
      toast.error("Passwords do not match");
      return;
    }
    const ok = await changePassword(formData);
    if (ok) {
      setFormData({ 
        currentPassword: "", 
        newPassword: "", 
        confirmPassword: "" 
      });
      navigate("/login");
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold">Change Password</h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose a strong password to protect your account
        </p>
  
        <div className="mb-4">
          <label className="block text-sm text-gray-700 font-medium">Current Password *</label>
          <div className="relative">
            <input
              type={show.current ? "text" : "password"}
              name="currentPassword"
              placeholder="Current password"
              value={formData.currentPassword}
              onChange={handleFormChange}
              className="w-full mt-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
            />
            {formData.currentPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShow({ ...show, current: !show.current })}
                className="absolute right-3 top-4 text-gray-500 cursor-pointer"
              >
                {show.current ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>
        </div>
  
        <div className="mb-4">
          <label className="block text-sm text-gray-700 font-medium">New Password *</label>
          <div className="relative">
            <input
              type={show.new ? "text" : "password"}
              value={formData.newPassword}
              placeholder="New password"
              name="newPassword"
              onChange={handleFormChange}
              className="w-full mt-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
            />
            {formData.newPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShow({ ...show, new: !show.new })}
                className="absolute right-3 top-4 text-gray-500 cursor-pointer"
              >
                {show.new ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>
        </div>
  
        <div className="mb-6">
          <label className="block text-sm text-gray-700 font-medium">Confirm Password *</label>
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleFormChange}
              className="w-full mt-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
            />
            {formData.confirmPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShow({ ...show, confirm: !show.confirm })}
                className="absolute right-3 top-4 text-gray-500 cursor-pointer"
              >
                {show.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
          </div>
        </div>
  
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={handleCancel} 
            disabled={formEmpty || loading}
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${
              formEmpty || loading
                ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400 cursor-pointer"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formEmpty || loading}
            className={`px-4 py-1.5 rounded-md text-white text-sm font-medium ${
              formEmpty || loading
                ? "bg-purple-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
            }`}
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <AiOutlineLoading3Quarters className="animate-spin text-white" />
                <span>Updating...</span>
              </div>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
