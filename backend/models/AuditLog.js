import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['application', 'scheme', 'user', 'deficiency', 'merit', 'document'],
      required: true
    },
    entityId: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
