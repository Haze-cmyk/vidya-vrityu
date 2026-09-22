import mongoose from 'mongoose';

const EligibilityRuleSchema = new mongoose.Schema({
  id: { type: String },
  field: { type: String, required: true },
  operator: { type: String, enum: ['eq', 'lt', 'gt', 'in', 'range'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
}, { _id: false });

const SchemeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Scholarship' },
    window: {
      start: { type: String, default: '' },
      end: { type: String, default: '' }
    },
    eligibility: [EligibilityRuleSchema],
    requiredDocs: [{ type: String }],
    stages: [{ type: String }],
    selectionCriteria: {
      type: String,
      enum: ['merit', 'need', 'hybrid'],
      default: 'hybrid'
    },
    amount: { type: String, default: '' },
    maxScholarshipAmount: { type: Number, default: 0 },
    totalSlots: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Scheme = mongoose.model('Scheme', SchemeSchema);
