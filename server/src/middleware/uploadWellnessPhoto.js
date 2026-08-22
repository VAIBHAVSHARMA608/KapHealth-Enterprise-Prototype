const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadRoot = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads", "wellness-photos");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
function fileFilter(req, file, cb) {
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG, PNG or WEBP images are allowed"));
}

const uploadWellnessPhoto = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024, files: 3 } });

module.exports = uploadWellnessPhoto;
