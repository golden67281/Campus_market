import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} buffer - The image file buffer from multer memoryStorage
 * @param {string} folder - The Cloudinary folder to store the image in (e.g. 'campus-market/products')
 * @returns {Promise<string>} - The secure public URL of the uploaded image
 */
export async function uploadToCloudinary(buffer, folder = 'campus-market/products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
          { quality: 'auto:good' },                      // Auto compress
          { fetch_format: 'auto' }                       // Auto best format (WebP etc.)
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Uploads an avatar image buffer to Cloudinary with square cropping.
 * @param {Buffer} buffer - The image file buffer from multer memoryStorage
 * @returns {Promise<string>} - The secure public URL of the uploaded avatar
 */
export async function uploadAvatarToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campus-market/avatars',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop, face-aware
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export default cloudinary;
