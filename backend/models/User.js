import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    loginId: { type: String, default: '', index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    altPhone: { type: String, default: '' },
    role: {
      type: String,
      required: true,
      enum: ['applicant', 'admin', 'officer', 'committee', 'institute'],
      default: 'applicant'
    },
    designation: { type: String, default: '' },
    state: { type: String, default: '' },
    officeAddress: { type: String, default: '' },
    landline: { type: String, default: '' },
    tribe: { type: String, default: '' },
    aadhaar: { type: String, default: '' },
    avatar: { type: String, default: '' },
    password: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
