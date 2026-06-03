import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

router.use(authMiddleware);

// Upload a single product/listing image → stored on Cloudinary
router.post('/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please provide an image to upload.' });
  }

  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'Image upload service is not configured. Please contact support.' });
    }

    const url = await uploadToCloudinary(req.file.buffer, 'campus-market/products');
    res.status(200).json({
      message: 'Image uploaded successfully!',
      url
    });
  } catch (err) {
    console.error('[Image Upload Error]', err.message);
    res.status(500).json({ message: 'Failed to upload image. Please try again.' });
  }
});

export default router;
