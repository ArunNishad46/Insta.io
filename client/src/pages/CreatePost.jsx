import { useState, useRef } from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

export default function CreatePost() {
  const { createPost } = useGlobalContext();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.post);

  const inputRef = useRef(null);

  const [formData, setFormData] = useState({
    caption: "",
    files: [],
    previews: []
  });

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + formData.files.length > 5) {
      alert("You can upload a maximum of 5 media files.");
      return;
    }
    const previews = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.includes("video") ? "video" : "image"
    }));

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
      previews: [...prev.previews, ...previews]
    }));

    inputRef.current.value = "";
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.files.length === 0) {
      toast.error("Please upload at least one image or video");
      return;
    }

    const fd = new FormData();
    fd.append("caption", formData.caption);
    formData.files.forEach((file) => fd.append("media", file));

    await createPost(fd);
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl px-10 py-8 flex flex-col items-center mt-15">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='flex flex-col items-center'>
            <img src={logo} alt="logo" className="w-15 mb-1" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Post</h2>
          </div>
  
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Caption</label>
            <textarea
              value={formData.caption}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, caption: e.target.value }))
              }
              placeholder="Write something..."
              rows={3}
              className="px-4 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-400"
            />
          </div>
  
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700">
              Add Media (max: 5)
            </label>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-400 file:cursor-pointer cursor-pointer text-gray-500"
            />
          </div>
  
          {formData.previews.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {formData.previews.map((media, index) => (
                <div key={index} className="relative">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt="preview"
                      className="w-full h-26 object-cover rounded"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-26 object-cover rounded"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer hover:bg-red-500 transition-all delay-20"
                  >
                    <RxCross2 className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}
  
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-700 to-orange-500 text-white py-2 rounded-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <AiOutlineLoading3Quarters className="animate-spin text-white" />
                <span>Posting...</span>
              </div>
            ) : (
              "Post"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
