const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Uploaded images are written to backend/uploads and served statically at
// /uploads/<filename> (see server.js). This is fine for local development
// and for a Render instance with a persistent disk attached — but on
// Render's default free/starter web service, the disk is wiped on every
// redeploy. Before going live, swap this for a hosted image service like
// Cloudinary (free tier is generous) — ask and I can wire that in.
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const upload = multer({
  storage,
  // Shared limit covers both — short product videos need more room than a
  // photo. Multer applies one fileSize limit per request, so this is set
  // high enough for a short clip; images will just rarely get near it.
  limits: { fileSize: 25 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP, GIF images or MP4/WEBM/MOV videos are allowed.'));
    }
    cb(null, true);
  },
});

function mediaTypeFor(file) {
  return ALLOWED_VIDEO_TYPES.includes(file.mimetype) ? 'video' : 'image';
}

module.exports = { upload, UPLOAD_DIR, mediaTypeFor };
