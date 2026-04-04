const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// Store file in memory (never touches disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 5,                   // max 5 files at once
  },
});

// Helper: wrap cloudinary upload_stream in a Promise
const streamUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// @POST /api/upload/image
// Upload a single image — returns { url, publicId }
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const result = await streamUpload(req.file.buffer, {
      folder: 'straypaws/adoptions',
      transformation: [
        { width: 1200, height: 900, crop: 'limit' }, // cap dimensions
        { quality: 'auto:good' },                    // auto compress
        { fetch_format: 'auto' },                    // serve webp to browsers that support it
      ],
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
  }
});

// @POST /api/upload/images
// Upload multiple images (up to 5) — returns array of { url, publicId }
router.post('/images', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided' });
    }

    const uploads = await Promise.all(
      req.files.map(file =>
        streamUpload(file.buffer, {
          folder: 'straypaws/adoptions',
          transformation: [
            { width: 1200, height: 900, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        })
      )
    );

    res.json({
      success: true,
      images: uploads.map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
      })),
    });
  } catch (error) {
    console.error('Cloudinary multi-upload error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
  }
});

// @DELETE /api/upload/image/:publicId
// Delete an image from Cloudinary (used when user removes a photo before submitting)
router.delete('/image/:publicId(*)', protect, async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Too many files. Max 5 images.' });
    }
  }
  res.status(400).json({ success: false, message: err.message });
});

module.exports = router;
