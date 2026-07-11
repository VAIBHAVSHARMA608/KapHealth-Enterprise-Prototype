const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadRoot = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads", "doctor-documents");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
function fileFilter(req, file, cb) {
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG, PNG or PDF files are allowed"));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
