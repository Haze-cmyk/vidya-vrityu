import express from 'express';
import multer from 'multer';
import { Document } from '../models/Document.js';
import { processDocumentOcr } from '../services/ocrService.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { docType = 'Certificate' } = req.body;
    let compareValues = {};
    if (req.body.compareValues) {
      try {
        compareValues = typeof req.body.compareValues === 'string'
          ? JSON.parse(req.body.compareValues)
          : req.body.compareValues;
      } catch (e) {
        compareValues = {};
      }
    }

    // Format file size
    const sizeInBytes = req.file.size;
    let sizeStr = '';
    if (sizeInBytes > 1024 * 1024) {
      sizeStr = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      sizeStr = (sizeInBytes / 1024).toFixed(0) + ' KB';
    }

    const docId = `doc-${Date.now()}`;
    const url = `/api/documents/${docId}/file`;

    // Process OCR via iLovePDF (or fallback)
    const ocrResult = await processDocumentOcr(
      req.file.buffer,
      req.file.originalname,
      docType,
      compareValues
    );

    // Save document to MongoDB
    const newDoc = await Document.create({
      id: docId,
      type: docType,
      fileName: req.file.originalname,
      fileSize: sizeStr,
      mimeType: req.file.mimetype || 'application/pdf',
      uploadedAt: new Date().toISOString(),
      status: ocrResult.ocrConfidence > 70 ? 'verified' : 'pending',
      data: req.file.buffer,
      url,
      ocrConfidence: ocrResult.ocrConfidence,
      ocrFields: ocrResult.ocrFields,
      extractedText: ocrResult.extractedText
    });

    return res.status(201).json({
      document: {
        id: newDoc.id,
        type: newDoc.type,
        fileName: newDoc.fileName,
        fileSize: newDoc.fileSize,
        uploadedAt: newDoc.uploadedAt,
        status: newDoc.status,
        url: newDoc.url,
        ocrConfidence: newDoc.ocrConfidence,
        ocrFields: newDoc.ocrFields
      },
      ocrFields: newDoc.ocrFields,
      ocrConfidence: newDoc.ocrConfidence,
      message: ocrResult.apiSuccess
        ? 'OCR extracted via iLovePDF'
        : ocrResult.error
        ? `OCR notice: ${ocrResult.error}. Manual verification enabled.`
        : 'Text processed successfully'
    });
  } catch (err) {
    console.error('Document upload error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/documents/:id/file (Stream binary file to browser)
router.get('/:id/file', async (req, res) => {
  try {
    const doc = await Document.findOne({ id: req.params.id });
    if (!doc || !doc.data) {
      return res.status(404).json({ message: 'Document file not found' });
    }

    res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
    return res.send(doc.data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/documents/:id (Metadata)
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findOne({ id: req.params.id }).select('-data').lean();
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
