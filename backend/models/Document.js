import mongoose from 'mongoose';

const OCRFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  field: { type: String, required: true },
  value: { type: String, required: true },
  confidence: { type: Number, default: 90 },
  sourceDocId: { type: String, default: '' },
  sourceDocName: { type: String, default: '' },
  pageNumber: { type: Number, default: 1 },
  isMismatch: { type: Boolean, default: false },
  expectedValue: { type: String, default: '' }
}, { _id: false });

const DocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: String, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    uploadedAt: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: ['pending', 'verified', 'deficient'],
      default: 'pending'
    },
    data: { type: Buffer },
    url: { type: String, default: '' },
    ocrConfidence: { type: Number, default: 0 },
    ocrFields: [OCRFieldSchema],
    extractedText: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', DocumentSchema);
