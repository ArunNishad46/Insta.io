import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const imageExts = [".jpg", ".jpeg", ".png", ".webp"];
const videoExts = [".mp4", ".mov", ".webm"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (imageExts.includes(ext) || videoExts.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error("Only image and video files are allowed"), false);
};

export const uploadPostMedia = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 100MB
  fileFilter,
}).array("media", 5);
