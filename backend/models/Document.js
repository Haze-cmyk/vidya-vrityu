import mongoose from 'mongoose';

const OCRFieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    field: { type: String, required: true },
    value: { type: String, required: true },
    confidence: { type: Number, default: 90 },
    sourceDocId: { type: String, default: '' },
    sourceDocName: { type: String, default: '' },
    pageNumber: { type: Number, default: 1 },
    isMismatch: { type: Boolean, default: false },
    expectedValue: { type: String, default: '' }
  },
  { _id: false }
);

const ExtractedFieldsSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: null },
    dateOfBirth: { type: String, default: null },
    casteCategory: { type: String, default: null },
    certificateNumber: { type: String, default: null },
    issuingAuthority: { type: String, default: null }
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: 'anonymous', index: true },
    type: { type: String, required: true, index: true }, // Document Type e.g. ST Caste Certificate
    docType: { type: String, default: '' }, // Alias / slug
    fileName: { type: String, required: true },
    fileSize: { type: String, required: true },
    mimeType: { type: String, default: 'application/pdf' },

    // Storage references on disk
    // NOTE: Railway container filesystems are ephemeral across redeploys.
    // For production, mount a Railway persistent volume or configure S3/Supabase bucket.
    originalPdfPath: { type: String, default: '' },
    extractedTextPath: { type: String, default: '' },

    // Extracted raw OCR text
    extractedText: { type: String, default: '' },

    // Structured fields extracted via Google Gemini AI
    extractedFields: { type: ExtractedFieldsSchema, default: () => ({}) },

    // Matching & Confidence Scores
    confidenceScores: {
      name: { type: Number, default: 0 },
      overall: { type: Number, default: 0 }
    },
    matches: {
      nameMatch: { type: Boolean, default: false },
      similarityScore: { type: Number, default: 0 },
      providedName: { type: String, default: '' },
      extractedName: { type: String, default: '' },
      rationale: { type: String, default: '' }
    },

    pageCount: { type: Number, default: 1 },
    ocrEngine: { type: String, default: 'tesseract-poppler' },
    status: {
      type: String,
      enum: ['pending', 'verified', 'deficient'],
      default: 'pending'
    },

    // Legacy fields for backward compatibility
    data: { type: Buffer },
    url: { type: String, default: '' },
    ocrConfidence: { type: Number, default: 0 },
    ocrFields: [OCRFieldSchema],

    uploadedAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', DocumentSchema);
