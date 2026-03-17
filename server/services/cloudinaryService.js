const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for multer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video and image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'video') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { cloudinary, upload, uploadToCloudinary, deleteFromCloudinary };
