// ============================================
// CampusMarket Express - File Upload Middleware
// ============================================
// This replaces NestJS FileInterceptor with multer.
// Configures storage, file filtering, and size limits.

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
const productsDir = path.join(__dirname, '..', 'uploads', 'products');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

/**
 * Profile Picture Upload Configuration
 * Replaces: @UseInterceptors(FileInterceptor('file', {...})) in auth.controller.ts
 */
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, profilesDir);
  },
  filename: (req, file, callback) => {
    // Use user ID from auth middleware, same as NestJS implementation
    const userId = req.user?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    callback(null, `profile-${userId}-${uniqueSuffix}${ext}`);
  },
});

const profilePictureFilter = (req, file, callback) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(new Error('Only image files are allowed'), false);
  }
  callback(null, true);
};

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: profilePictureFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
}).single('file'); // Field name 'file' matches NestJS

/**
 * Product Images Upload Configuration
 * For future use when product image upload is implemented
 */
const productImagesStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, productsDir);
  },
  filename: (req, file, callback) => {
    const userId = req.user?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    callback(null, `product-${userId}-${uniqueSuffix}${ext}`);
  },
});

const uploadProductImages = multer({
  storage: productImagesStorage,
  fileFilter: profilePictureFilter, // Same filter for images
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
}).array('images', 5); // Up to 5 images

/**
 * Middleware wrapper for handling multer errors
 * Provides consistent error responses like NestJS BadRequestException
 */
function handleUploadError(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB', statusCode: 400 });
        }
        return res.status(400).json({ message: err.message, statusCode: 400 });
      } else if (err) {
        return res.status(400).json({ message: err.message, statusCode: 400 });
      }
      next();
    });
  };
}

module.exports = {
  uploadProfilePicture: handleUploadError(uploadProfilePicture),
  uploadProductImages: handleUploadError(uploadProductImages),
};
