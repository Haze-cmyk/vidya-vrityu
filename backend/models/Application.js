import mongoose from 'mongoose';

const DeficiencySchema = new mongoose.Schema({
  raisedAt: { type: String, default: () => new Date().toISOString() },
  raisedBy: { type: String, default: '' },
  reasons: [{ type: String }],
  note: { type: String, default: '' },
  resolvedAt: { type: String },
  round: { type: Number, default: 1 },
  resubmittedDocs: [{ type: String }]
}, { _id: false });

const ApplicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    applicantId: { type: String, required: true, index: true },
    applicantName: { type: String, required: true },
    schemeId: { type: String, required: true },
    schemeCode: { type: String, required: true },
    schemeName: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_verification',
        'query_raised',
        'verified',
        'scrutinized',
        'selected',
        'rejected',
        'disbursed'
      ],
      default: 'submitted'
    },
    currentStage: { type: Number, default: 1 },
    submittedAt: { type: String, default: () => new Date().toISOString() },
    lastUpdatedAt: { type: String, default: () => new Date().toISOString() },
    personal: {
      fullName: { type: String, default: '' },
      dob: { type: String, default: '' },
      gender: { type: String, default: 'Other' },
      category: { type: String, default: 'ST' },
      tribeName: { type: String, default: '' },
      fatherName: { type: String, default: '' },
      motherName: { type: String, default: '' },
      aadhaarMasked: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      physicallyHandicapped: { type: String, default: 'No' },
      annualIncome: { type: Number, default: 0 }
    },
    address: {
      permanentAddress: { type: String, default: '' },
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      pincode: { type: String, default: '' },
      domicileCertNo: { type: String, default: '' },
      domicileState: { type: String, default: '' }
    },
    academic: {
      highestQualification: { type: String, default: '' },
      institutionName: { type: String, default: '' },
      courseName: { type: String, default: '' },
      passingYear: { type: String, default: '' },
      percentageOrCgpa: { type: Number, default: 0 },
      rollNumber: { type: String, default: '' }
    },
    schemeSpecific: { type: mongoose.Schema.Types.Mixed, default: {} },
    bank: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      branchName: { type: String, default: '' },
      passbookDocId: { type: String }
    },
    documents: [{ type: mongoose.Schema.Types.Mixed }],
    ocrFields: [{ type: mongoose.Schema.Types.Mixed }],
    deficiency: DeficiencySchema,
    deficiencyHistory: [DeficiencySchema],
    score: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    verifiedBy: { type: String, default: '' },
    verifiedAt: { type: String },
    anomalyFlags: [{ type: String }]
  },
  { timestamps: true }
);

export const Application = mongoose.model('Application', ApplicationSchema);
