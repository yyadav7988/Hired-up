const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const { authenticate, candidateOnly } = require('../middleware/auth');

const router = express.Router();
const multer = require('multer');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'certificates');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname || '.pdf')),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname || '').toLowerCase();
    if (ext.endsWith('.pdf')) return cb(null, true);
    cb(new Error('Only PDF files allowed'));
  },
});

router.use(authenticate);
router.use(candidateOnly);

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

async function callMLVerify(filePath, url) {
  try {
    const body = url ? { credential_url: url } : { file_path: filePath };
    const res = await fetch(ML_URL + '/verify/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { trust_score: 0, status: 'FAILED', error: e.message };
  }
}

/**
 * GET /certificates - List candidate's certificates
 */
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find({ candidate_id: req.user.id }).sort({ created_at: -1 });
    res.json(certificates.map(c => ({
      id: c.id,
      platform: c.platform,
      credential_url: c.credential_url,
      trust_score: c.trust_score,
      status: c.status,
      created_at: c.created_at
    })));
  } catch (err) {
    console.error('Certificates list error:', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

/**
 * POST /certificates/upload - Upload and verify PDF
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const verifyResult = await callMLVerify(filePath);

    const id = uuidv4();
    const trustScore = verifyResult.trust_score ?? 0;
    const status = (verifyResult.status || 'PENDING').toUpperCase().replace('UNVERIFIABLE', 'FAILED');

    const newCert = new Certificate({
      _id: id,
      candidate_id: req.user.id,
      platform: verifyResult.platform || 'unknown',
      file_path: filePath,
      trust_score: trustScore,
      status: status,
      metadata: verifyResult.metadata || {}
    });

    await newCert.save();

    res.status(201).json({
      id,
      platform: verifyResult.platform,
      trustScore,
      status,
    });
  } catch (err) {
    console.error('Certificate upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

/**
 * POST /certificates/url - Verify by URL
 */
router.post('/url', async (req, res) => {
  try {
    const { credentialUrl } = req.body;
    if (!credentialUrl || typeof credentialUrl !== 'string') {
      return res.status(400).json({ error: 'credentialUrl required' });
    }

    const verifyResult = await callMLVerify(null, credentialUrl);

    const id = uuidv4();
    const trustScore = verifyResult.trust_score ?? 0;
    const status = (verifyResult.status || 'PENDING').toUpperCase().replace('UNVERIFIABLE', 'FAILED');

    const newCert = new Certificate({
      _id: id,
      candidate_id: req.user.id,
      platform: verifyResult.platform || 'unknown',
      credential_url: credentialUrl,
      trust_score: trustScore,
      status: status,
      metadata: verifyResult.metadata || {}
    });

    await newCert.save();

    res.status(201).json({
      id,
      platform: verifyResult.platform,
      trustScore,
      status,
    });
  } catch (err) {
    console.error('Certificate URL error:', err);
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

module.exports = router;
