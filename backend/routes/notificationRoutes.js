import express from 'express';
import { Notification } from '../models/Notification.js';

const router = express.Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = {};
    if (userId && userId !== 'ALL') {
      filter.userId = userId;
    }
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { id: req.params.id },
      { $set: { read: true } },
      { new: true }
    );
    return res.json(notif || { success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type = 'info', link } = req.body;
    const newNotif = await Notification.create({
      id: `notif-${Date.now()}`,
      userId: userId || 'ALL',
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString()
    });
    return res.status(201).json(newNotif);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
