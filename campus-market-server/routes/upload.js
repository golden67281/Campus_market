import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Upload a single product/listing image
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please provide an image to upload.' });
  }

  const fileUrl = `/uploads/products/${req.file.filename}`;
  res.status(200).json({
    message: 'Image uploaded successfully!',
    url: fileUrl
  });
});

export default router;
