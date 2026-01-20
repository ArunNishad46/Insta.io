import cloudinary from "../config/cloudinary.js";
import path from 'path';

const cloudinaryUpload = async (filePath, folder = "Instaio", forceImage=false) => {
  try {
    const ext = path.extname(filePath).toLowerCase();

    const imageExts = [".jpg", ".jpeg", ".png", ".webp"];
    const videoExts = [".mp4", ".mov", ".avi", ".webm", ".mkv"];

    const isImage = imageExts.includes(ext);
    const isVideo = videoExts.includes(ext);

    if (forceImage) {
      if (!isImage) {
        throw new Error("Only image files are allowed.");
      }
    } else {
      if (!isImage && !isVideo) {
        throw new Error("Unsupported file type. Only images and videos are allowed.");
      }
    }

    const resourceType = forceImage ? "image" : (isVideo ? "video" : "image");

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: resourceType,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    throw new Error("Image upload failed");
  }
};

export default cloudinaryUpload;
