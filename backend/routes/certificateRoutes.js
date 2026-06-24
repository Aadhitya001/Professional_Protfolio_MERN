import express from 'express';
import Certificate from '../models/Certificate.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const UPLOAD_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage for certificate images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `certificate-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find({});
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a certificate
// @route   POST /api/certificates
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const certificateData = { ...req.body, image: imageUrl };
    const certificate = new Certificate(certificateData);
    const createdCertificate = await certificate.save();
    res.status(201).json(createdCertificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (certificate) {
      Object.assign(certificate, req.body);
      const updatedCertificate = await certificate.save();
      res.json(updatedCertificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (certificate) {
      await certificate.deleteOne();
      res.json({ message: 'Certificate removed' });
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
