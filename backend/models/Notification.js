import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', NotificationSchema);
