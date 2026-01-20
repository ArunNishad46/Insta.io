import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../context/GlobalContext";
import { useNavigate } from "react-router-dom";
import avatar from "../assets/avatar.png";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ProfileSettings() {
  const profile = useSelector((state) => state.user.myProfile);
  const loading = useSelector((state) => state.user.loading);
  const navigate = useNavigate();

  const {
    fetchMyProfile,
    updateProfileImage,
    deleteProfileImage,
    updateProfileDetails,
    deleteAccount,
  } = useGlobalContext();

  const fileRef = useRef(null);

  //for delete account password
  const [show, setShow] = useState(false);

  const [originalData, setOriginalData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      const data = {
        fullname: profile.fullname || "",
        username: profile.username || "",
        email: profile.email || "",
        bio: profile.bio || "",
      };

      setFormData(data);
      setOriginalData(data);
    }
  }, [profile]);

  const isDirty = originalData && JSON.stringify(formData) !== JSON.stringify(originalData);


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("profileImage", file);

    const ok = await updateProfileImage(fd);
    setUploading(false);
    if (ok) fetchMyProfile();
  };

  const handleDeleteProfileImage = async () => {
    const ok = await deleteProfileImage();
    if (ok) fetchMyProfile();
  }

  const handleSave = async (e) => {
    if (!isDirty) return;
    setSaving(true);
    const ok = await updateProfileDetails(formData);
    setSaving(false);
    if (ok) {
      await fetchMyProfile();
      setOriginalData(formData);
    }
  };

  const handleCancel = () => {
    if (!isDirty) return;
      setFormData(originalData); 
  };

  const handlePrivacyToggle = async (value) => {
    const ok = await updateProfileDetails({ isPrivate: value }); 
    if (ok) fetchMyProfile();
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword.trim()) return;
    const ok = await deleteAccount({ password: deletePassword });
    if (ok) {
      setShowDeleteModal(false);
      setDeletePassword("");
      navigate("/signup");
    }
  };

  const handleModalShow = () => {
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setDeletePassword("");
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-2">
      <h2 className="text-xl font-semibold">Profile Settings</h2>
      <p className="text-sm text-gray-500 mb-6">Update your profile details</p>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={profile?.profileImage || avatar}
          alt="profile"
          className="w-20 h-20 rounded-full object-cover border"
        />

        <div className="flex gap-4">
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className={`px-3 py-1.5 rounded-md text-sm text-white
            ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 cursor-pointer"}
          `}
          >
            {uploading ? (
              <div className='flex items-center justify-center gap-2'>
                <AiOutlineLoading3Quarters className="animate-spin text-white" />
                <span>Uploading...</span>
              </div>
            ) : (
              "Upload Image"
            )}
          </button>

          <button
            onClick={handleDeleteProfileImage}
            disabled={!profile?.profileImage}
            className="px-4 py-1.5 rounded-md bg-gray-300 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Delete
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium">Full Name *</label>
        <input
          type="text"
          value={formData.fullname}
          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          className="w-full mt-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 font-medium">Username *</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full mt-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 font-medium">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mt-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 font-medium">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full min-h-17.5 mt-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button 
          onClick={handleCancel} 
          disabled={!isDirty}
          className={`px-4 py-2 rounded-md ${
            !isDirty
              ? "bg-gray-300 cursor-not-allowed opacity-60"
              : "bg-gray-300 hover:bg-gray-400 cursor-pointer"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`px-4 py-2 rounded-md text-white ${!isDirty ? "bg-gray-400 cursor-not-allowed" : saving ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
          }`}
        >
          {saving ? (
            <div className='flex items-center justify-center gap-2'>
              <AiOutlineLoading3Quarters className="animate-spin text-white" />
                <span>Saving...</span>
            </div>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mt-10">
        <div>
          <span className="text-sm font-medium">Account Privacy</span>
          <p className="text-xs text-gray-500">
            Only followers can see your posts & profile
          </p>
        </div>
      
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-gray-600">
            {profile?.isPrivate ? "Private" : "Public"}
          </span>
      
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={profile?.isPrivate}
              onChange={(e) => handlePrivacyToggle(e.target.checked)}
            />
      
            <div className={`w-11 h-6 relative rounded-full transition-colors ${
              profile?.isPrivate ? "bg-purple-600" : "bg-gray-400"
            }`}>
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{
                  transform: profile?.isPrivate ? "translateX(20px)" : "translateX(0px)",
                }}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 mb-4">
        <div>
          <span className="text-sm font-medium">Account Deletion</span>
          <p className="text-xs text-gray-500">
            This action cannot be undone. Enter your password to continue.
          </p>
        </div>
        <button
          onClick={handleModalShow}
          className="bg-red-500 text-white text-sm font-semibold px-2 py-1.5 ml-4 rounded-md cursor-pointer hover:bg-red-600 whitespace-nowrap"
        >
          Delete Account
        </button>
      </div>
    </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-xl">
            <form>
              <h3 className="text-lg font-semibold mb-2">Confirm Account Deletion</h3>
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. Enter your password to continue.
              </p>
        
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full my-1 px-4 py-1.5 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-purple-400"
                />
                {deletePassword.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-4 text-gray-500 cursor-pointer"
                  >
                    {show ? <FiEyeOff /> : <FiEye />}
                  </button>
                )}
              </div>
        
              <div className="flex gap-4 justify-end mt-4">
                <button
                  onClick={handleModalClose}
                  className="px-3 py-1.5 bg-gray-300 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
        
                <button
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword.trim()}
                  className={`px-3 py-1.5 rounded-md text-white ${
                    !deletePassword.trim()
                      ? "bg-red-600 cursor-not-allowed opacity-60"
                      : "bg-red-600 hover:bg-red-700 cursor-pointer"
                  }`}
                >
                  {loading ? (
                    <div className='flex items-center justify-center gap-2'>
                      <AiOutlineLoading3Quarters className="animate-spin text-white" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
