import express from 'express';
import Certificate from '../models/Certificate.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

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
router.post('/', protect, async (req, res) => {
  try {
    const certificate = new Certificate(req.body);
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
