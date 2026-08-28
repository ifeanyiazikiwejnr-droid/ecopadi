const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

// Product photos are uploaded here (in memory, briefly) and then pushed to
// Cloudinary, which gives every image a permanent, public URL. This is
// deliberately NOT local disk storage — Render's free/starter web service
// wipes its disk on every redeploy, which silently deletes any images saved
// there. Cloudinary's free tier (25GB storage + bandwidth/month) survives
// redeploys and is the right home for this.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 8 }, // 8MB per image, up to 8 at once
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed.'));
    }
    cb(null, true);
  },
});

// Uploads a single in-memory file buffer to Cloudinary and resolves with its
// result object — result.secure_url is the permanent image URL to store,
// result.public_id is what's needed later to delete it from Cloudinary.
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ecopadi-products' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = { upload, uploadBufferToCloudinary, cloudinary };
