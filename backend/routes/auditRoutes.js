import express from 'express';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// GET /api/audit
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/audit
router.post('/', async (req, res) => {
  try {
    const { actorId, actorName, actorRole, action, entityType, entityId, metadata } = req.body;
    const entry = await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: actorId || 'usr-system',
      actorName: actorName || 'System',
      actorRole: actorRole || 'officer',
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      metadata
    });
    return res.status(201).json(entry);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
