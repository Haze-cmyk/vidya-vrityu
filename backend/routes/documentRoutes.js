import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Document } from '../models/Document.js';
import { User } from '../models/User.js';
import { processPdfOcr } from '../services/pdfOcrPipeline.js';
import { extractFieldsWithGemini } from '../services/geminiService.js';
import { compareNamesFuzzy } from '../services/fuzzyMatchingService.js';

const router = express.Router();

// Initialize disk storage paths
// NOTE: For Railway production deployments, container filesystems are ephemeral across redeploys.
// Attach a Railway persistent volume or connect an S3/Supabase storage bucket for permanent multi-instance storage.
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const PDFS_DIR = path.join(UPLOADS_DIR, 'pdfs');
const OCR_TEXTS_DIR = path.join(UPLOADS_DIR, 'ocr_texts');

for (const dir of [UPLOADS_DIR, PDFS_DIR, OCR_TEXTS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Strict PDF-only file filter for Multer
 */
const pdfOnlyFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type: Only .pdf files are accepted. All other file formats are strictly rejected.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: pdfOnlyFilter
});

/**
 * Clean strings for safe filesystem naming
 */
function sanitizeForFilename(str) {
  return (str || 'doc').replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
}

/**
 * Format bytes into human-readable string
 */
function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  if (bytes > 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
  return (bytes / 1024).toFixed(0) + ' KB';
}

/**
 * Core Document Processing Pipeline
 */
async function runDocumentVerificationPipeline({ file, body }) {
  const {
    userId = 'applicant_default',
    docType = 'ST Caste Certificate',
    compareName = '',
    fullName = ''
  } = body;

  const timestamp = Date.now();
  const safeUserId = sanitizeForFilename(userId);
  const safeDocType = sanitizeForFilename(docType);
  const docId = `doc-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Save original PDF to disk inside Railway container
  const pdfFilename = `${safeUserId}_${safeDocType}_${timestamp}.pdf`;
  const pdfFilePath = path.join(PDFS_DIR, pdfFilename);
  fs.writeFileSync(pdfFilePath, file.buffer);
  console.log(`[Storage] Saved original PDF to disk: ${pdfFilePath}`);

  // 2. Run PDF OCR extraction (poppler-utils -> Tesseract.js with fallback)
  console.log(`[Pipeline] Initiating OCR pipeline for ${file.originalname}...`);
  const ocrResult = await processPdfOcr(pdfFilePath, file.buffer);
  console.log(`[Pipeline] OCR complete. Engine: ${ocrResult.ocrEngine}, Length: ${ocrResult.fullText.length} chars.`);

  // 3. Save raw extracted OCR text as a separate .txt file named to match original document
  const ocrTextFilename = `${safeUserId}_${safeDocType}_${timestamp}_ocr.txt`;
  const ocrTextFilePath = path.join(OCR_TEXTS_DIR, ocrTextFilename);
  fs.writeFileSync(ocrTextFilePath, ocrResult.fullText, 'utf-8');
  console.log(`[Storage] Saved raw OCR text to disk: ${ocrTextFilePath}`);

  // 4. Extract structured fields via Google Gemini API (Free tier)
  console.log(`[Pipeline] Calling Google Gemini API for structured field extraction...`);
  const extractedFields = await extractFieldsWithGemini(ocrResult.fullText, docType);

  // 5. Look up user's registered name for fuzzy matching comparison
  let signupName = compareName || fullName;
  if (!signupName && userId && userId !== 'applicant_default') {
    try {
      const user = await User.findOne({
        $or: [{ id: userId }, { loginId: userId }, { email: userId }]
      });
      if (user && user.name) {
        signupName = user.name;
      }
    } catch (dbErr) {
      console.warn('[Pipeline] Could not query user for name matching:', dbErr.message);
    }
  }

  // Fallback to name parsed from compareValues JSON if passed
  if (!signupName && body.compareValues) {
    try {
      const parsedCompare = typeof body.compareValues === 'string'
        ? JSON.parse(body.compareValues)
        : body.compareValues;
      signupName = parsedCompare.fullName || parsedCompare.name || '';
    } catch (e) {
      // Ignore parse error
    }
  }

  // 6. Fuzzy string matching: compare extracted name against user signup name
  const nameComparison = compareNamesFuzzy(signupName, extractedFields.fullName);
  console.log(`[Matching] Name comparison: "${signupName}" vs "${extractedFields.fullName}" => Score: ${nameComparison.similarityScore}`);

  // Calculate overall confidence score
  let overallConfidence = ocrResult.confidence || 75;
  if (extractedFields.fullName) {
    overallConfidence = Math.round((overallConfidence * 0.4) + (nameComparison.similarityScore * 0.6));
  }

  // Build UI-compatible ocrFields array for existing verification views
  const uiOcrFields = [
    {
      id: `${docId}-name`,
      field: 'Candidate Full Name',
      value: extractedFields.fullName || 'Not Found',
      confidence: nameComparison.similarityScore,
      isMismatch: !nameComparison.isMatch && !!extractedFields.fullName,
      expectedValue: signupName || 'N/A',
      sourceDocName: file.originalname,
      pageNumber: 1
    },
    {
      id: `${docId}-dob`,
      field: 'Date of Birth',
      value: extractedFields.dateOfBirth || 'Not Mentioned',
      confidence: extractedFields.dateOfBirth ? 90 : 40,
      isMismatch: false,
      expectedValue: '',
      sourceDocName: file.originalname,
      pageNumber: 1
    },
    {
      id: `${docId}-caste`,
      field: 'Caste Category',
      value: extractedFields.casteCategory || 'General / Unspecified',
      confidence: extractedFields.casteCategory ? 92 : 50,
      isMismatch: false,
      expectedValue: 'ST',
      sourceDocName: file.originalname,
      pageNumber: 1
    }
  ];

  if (extractedFields.certificateNumber) {
    uiOcrFields.push({
      id: `${docId}-cert`,
      field: 'Certificate Number',
      value: extractedFields.certificateNumber,
      confidence: 95,
      isMismatch: false,
      expectedValue: '',
      sourceDocName: file.originalname,
      pageNumber: 1
    });
  }

  // 7. Save document record in MongoDB Atlas
  const newDocument = await Document.create({
    id: docId,
    userId: userId || 'anonymous',
    type: docType,
    docType: safeDocType,
    fileName: file.originalname,
    fileSize: formatBytes(file.size),
    mimeType: 'application/pdf',

    // Local disk references
    originalPdfPath: pdfFilePath,
    extractedTextPath: ocrTextFilePath,
    extractedText: ocrResult.fullText,

    // Gemini extracted fields
    extractedFields: {
      fullName: extractedFields.fullName,
      dateOfBirth: extractedFields.dateOfBirth,
      casteCategory: extractedFields.casteCategory,
      certificateNumber: extractedFields.certificateNumber,
      issuingAuthority: extractedFields.issuingAuthority
    },

    // Fuzzy matching & confidence scores
    confidenceScores: {
      name: nameComparison.similarityScore,
      overall: overallConfidence
    },
    matches: {
      nameMatch: nameComparison.isMatch,
      similarityScore: nameComparison.similarityScore,
      providedName: signupName,
      extractedName: extractedFields.fullName || '',
      rationale: nameComparison.rationale
    },

    pageCount: ocrResult.pageCount || 1,
    ocrEngine: ocrResult.ocrEngine,
    status: overallConfidence >= 75 ? 'verified' : 'pending',

    // UI compatibility fields
    data: file.buffer,
    url: `/api/documents/${docId}/file`,
    ocrConfidence: overallConfidence,
    ocrFields: uiOcrFields,
    uploadedAt: new Date().toISOString()
  });

  console.log(`[Database] Created Document record ${docId} in MongoDB Atlas`);

  return {
    document: newDocument,
    extractedFields,
    confidenceScores: {
      name: nameComparison.similarityScore,
      overall: overallConfidence
    },
    matches: {
      isMatch: nameComparison.isMatch,
      similarityScore: nameComparison.similarityScore,
      providedName: signupName,
      extractedName: extractedFields.fullName,
      rationale: nameComparison.rationale
    },
    ocrEngine: ocrResult.ocrEngine,
    pageCount: ocrResult.pageCount,
    uiOcrFields
  };
}

/**
 * POST /api/documents/verify
 * Main document verification endpoint:
 * Strictly accepts .pdf, saves PDF to disk, extracts text via Tesseract OCR,
 * saves text to disk, extracts fields via Gemini AI, computes fuzzy match score,
 * and records to MongoDB Atlas.
 */
router.post('/verify', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide a valid .pdf document.'
      });
    }

    const result = await runDocumentVerificationPipeline({
      file: req.file,
      body: req.body
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded, OCR extracted, and verified successfully.',
      documentId: result.document.id,
      document: {
        id: result.document.id,
        userId: result.document.userId,
        type: result.document.type,
        fileName: result.document.fileName,
        fileSize: result.document.fileSize,
        originalPdfPath: result.document.originalPdfPath,
        extractedTextPath: result.document.extractedTextPath,
        url: result.document.url,
        status: result.document.status,
        uploadedAt: result.document.uploadedAt
      },
      extractedFields: result.extractedFields,
      confidenceScores: result.confidenceScores,
      matches: result.matches,
      ocrEngine: result.ocrEngine,
      pageCount: result.pageCount,
      ocrFields: result.uiOcrFields
    });
  } catch (err) {
    console.error('Error in /api/documents/verify:', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal error processing document verification'
    });
  }
});

/**
 * POST /api/documents/upload
 * Backwards-compatible route for existing frontend integration
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await runDocumentVerificationPipeline({
      file: req.file,
      body: req.body
    });

    return res.status(201).json({
      success: true,
      document: {
        id: result.document.id,
        type: result.document.type,
        fileName: result.document.fileName,
        fileSize: result.document.fileSize,
        uploadedAt: result.document.uploadedAt,
        status: result.document.status,
        url: result.document.url,
        ocrConfidence: result.confidenceScores.overall,
        ocrFields: result.uiOcrFields
      },
      ocrFields: result.uiOcrFields,
      ocrConfidence: result.confidenceScores.overall,
      extractedFields: result.extractedFields,
      confidenceScores: result.confidenceScores,
      matches: result.matches,
      message: `Document verified (${result.ocrEngine}). Name match confidence: ${result.confidenceScores.name}%.`
    });
  } catch (err) {
    console.error('Error in /api/documents/upload:', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal error during document upload'
    });
  }
});

/**
 * GET /api/documents/:id/file
 * Stream binary PDF to browser for fullscreen preview
 */
router.get('/:id/file', async (req, res) => {
  try {
    const doc = await Document.findOne({ id: req.params.id });
    if (!doc) {
      return res.status(404).json({ message: 'Document file not found' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.removeHeader('X-Frame-Options');

    // Try reading from disk first
    if (doc.originalPdfPath && fs.existsSync(doc.originalPdfPath)) {
      res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${doc.fileName || 'document.pdf'}"`);
      return fs.createReadStream(doc.originalPdfPath).pipe(res);
    }

    // Fallback to in-memory Buffer from MongoDB if disk copy was rotated
    if (doc.data) {
      res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${doc.fileName || 'document.pdf'}"`);
      return res.send(doc.data);
    }

    return res.status(404).json({ message: 'Document file content not found on disk or database' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/documents/:id/text
 * Stream raw extracted OCR text file
 */
router.get('/:id/text', async (req, res) => {
  try {
    const doc = await Document.findOne({ id: req.params.id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (doc.extractedTextPath && fs.existsSync(doc.extractedTextPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return fs.createReadStream(doc.extractedTextPath).pipe(res);
    }

    if (doc.extractedText) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(doc.extractedText);
    }

    return res.status(404).json({ message: 'OCR text not found for this document' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/documents/:id
 * Retrieve document metadata, confidence scores, and extracted fields
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findOne({ id: req.params.id }).select('-data');
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/documents/user/:userId
 * Retrieve all verified documents belonging to a specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.params.userId }).select('-data').sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
