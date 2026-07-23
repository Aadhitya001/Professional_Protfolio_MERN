import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { protect } from '../middleware/authMiddleware.js';
import PrivateDocument from '../models/PrivateDocument.js';
import DocumentAccess from '../models/DocumentAccess.js';

const router = express.Router();

// Multer - memory storage (base64 encode later)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images (JPEG, PNG) and PDFs allowed'), false);
  }
});

// ─────────────────────────────────────────
// DOCUMENT ROUTES (Admin only)
// ─────────────────────────────────────────

// @desc   Upload a private document
// @route  POST /api/private-docs
// @access Private (Admin)
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { title, category } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const base64 = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64}`;

    const doc = await PrivateDocument.create({
      title,
      category: category || 'Other',
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Get all private documents (metadata only, no fileUrl)
// @route  GET /api/private-docs
// @access Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const docs = await PrivateDocument.find({}).select('-fileUrl');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Delete a private document
// @route  DELETE /api/private-docs/:id
// @access Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const doc = await PrivateDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────
// ACCESS TOKEN ROUTES (Admin only)
// ─────────────────────────────────────────

// @desc   Create an access token
// @route  POST /api/private-docs/access
// @access Private (Admin)
router.post('/access', protect, async (req, res) => {
  try {
    const { label, expiresAt, documentIds, allowDownload } = req.body;
    if (!label || !expiresAt) return res.status(400).json({ message: 'Label and expiry date required' });
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one document' });
    }

    const accessToken = crypto.randomBytes(32).toString('hex');

    const access = await DocumentAccess.create({
      accessToken,
      label,
      expiresAt: new Date(expiresAt),
      isActive: true,
      documentIds,
      allowDownload: allowDownload !== undefined ? allowDownload : true
    });

    res.status(201).json(access);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Get all access tokens
// @route  GET /api/private-docs/access
// @access Private (Admin)
router.get('/access', protect, async (req, res) => {
  try {
    const tokens = await DocumentAccess.find({}).sort({ createdAt: -1 });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Revoke an access token
// @route  DELETE /api/private-docs/access/:id
// @access Private (Admin)
router.delete('/access/:id', protect, async (req, res) => {
  try {
    const access = await DocumentAccess.findById(req.params.id);
    if (!access) return res.status(404).json({ message: 'Token not found' });
    await access.deleteOne();
    res.json({ message: 'Access token revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────
// PUBLIC VIEWER ROUTE
// ─────────────────────────────────────────

// @desc   Validate token & get documents (viewer)
// @route  GET /api/private-docs/view/:token
// @access Public (with valid token)
router.get('/view/:token', async (req, res) => {
  try {
    const access = await DocumentAccess.findOne({ accessToken: req.params.token });

    if (!access) return res.status(403).json({ message: 'Invalid access link.' });
    if (!access.isActive) return res.status(403).json({ message: 'This access link has been revoked.' });
    if (new Date() > new Date(access.expiresAt)) return res.status(403).json({ message: 'This access link has expired.' });

    // Fetch docs — filter by documentIds if specified
    const allDocs = await PrivateDocument.find({});
    const docs = access.documentIds && access.documentIds.length > 0
      ? allDocs.filter(d => {
          const docIdStr = String(d._id);
          return access.documentIds.some(id => String(id) === docIdStr);
        })
      : allDocs;

    res.json({
      label: access.label,
      expiresAt: access.expiresAt,
      allowDownload: access.allowDownload !== undefined ? access.allowDownload : true,
      documents: docs.map(d => ({
        _id: d._id,
        title: d.title,
        category: d.category,
        fileName: d.fileName,
        fileType: d.fileType,
        fileUrl: d.fileUrl
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc   Log viewer info after they confirm their identity
// @route  POST /api/private-docs/view/:token/log
// @access Public (with valid token)
router.post('/view/:token/log', async (req, res) => {
  try {
    const { viewerName, viewerEmail } = req.body;
    const access = await DocumentAccess.findOne({ accessToken: req.params.token });

    if (!access || !access.isActive || new Date() > new Date(access.expiresAt)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    access.viewerName = viewerName || access.viewerName;
    access.viewerEmail = viewerEmail || access.viewerEmail;
    access.viewedAt = new Date();
    access.viewCount = (access.viewCount || 0) + 1;
    
    if (!Array.isArray(access.viewers)) {
      access.viewers = [];
    }
    access.viewers.push({
      name: viewerName || 'Anonymous',
      email: viewerEmail || 'N/A',
      viewedAt: new Date()
    });

    await access.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
