const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Optional public ID
 */
const uploadToCloudinary = (buffer, folder = 'fixfirst', publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
      ],
    };

    if (publicId) {
      options.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

/**
 * Upload multiple buffers
 */
const uploadMultiple = async (files, folder) => {
  const uploads = files.map((file) =>
    uploadToCloudinary(file.buffer, folder)
  );
  return Promise.all(uploads);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultiple,
};
