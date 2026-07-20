import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure storage using memory storage
const storage = multer.memoryStorage();

// Configure file filters
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (PNG, JPG, JPEG, GIF) and documents (PDF, DOC, DOCX) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @desc    Upload a single file (image or document)
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Convert file buffer to base64 data URL
    const base64Data = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    
    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
