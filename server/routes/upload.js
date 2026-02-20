import express from 'express';
import multer from 'multer';
import { uploadBikeImage, deleteBikeImage, generateBikeImageVariants } from '../utils/imageUpload.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Upload bike image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const fileName = `bike_${Date.now()}_${req.file.originalname}`;
    const uploadResult = await uploadBikeImage(req.file.buffer, fileName);

    // Generate image variants
    const variants = generateBikeImageVariants(uploadResult.public_id);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        size: uploadResult.bytes,
        variants: variants
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete bike image
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await deleteBikeImage(publicId);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get optimized image URL
router.get('/optimize/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop, quality } = req.query;

    const options = {};
    if (width) options.width = parseInt(width);
    if (height) options.height = parseInt(height);
    if (crop) options.crop = crop;
    if (quality) options.quality = quality;

    const variants = generateBikeImageVariants(publicId);

    res.json({
      success: true,
      variants: variants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
