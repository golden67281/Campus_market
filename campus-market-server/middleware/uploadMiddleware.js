import multer from 'multer';

// Use memory storage — files are held as Buffer in req.file.buffer
// and then uploaded to Cloudinary (no local disk writes needed)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
