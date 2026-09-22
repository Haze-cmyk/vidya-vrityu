import express from 'express';
import { Scheme } from '../models/Scheme.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// GET /api/schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 }).lean();
    return res.json(schemes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/schemes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scheme = await Scheme.findOne({
      $or: [{ id }, { code: id }]
    }).lean();

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    return res.json(scheme);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/schemes
router.post('/', async (req, res) => {
  try {
    const schemeData = req.body;
    const id = schemeData.id || `scheme-${Date.now()}`;
    const code = schemeData.code || 'CUSTOM';

    const newScheme = await Scheme.create({
      id,
      code,
      name: schemeData.name || 'New ST Scheme',
      description: schemeData.description || '',
      category: schemeData.category || 'Scholarship',
      window: schemeData.window || { start: '2026-09-01', end: '2026-12-31' },
      eligibility: schemeData.eligibility || [],
      requiredDocs: schemeData.requiredDocs || ['ST Caste Certificate', 'Income Certificate'],
      stages: schemeData.stages || ['Submitted', 'Verified', 'Selected'],
      selectionCriteria: schemeData.selectionCriteria || 'merit',
      amount: schemeData.amount || '₹50,000 / year',
      maxScholarshipAmount: schemeData.maxScholarshipAmount || 50000,
      totalSlots: schemeData.totalSlots || 500,
      active: true
    });

    // Log audit
    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName: 'MoTA Admin',
      actorRole: 'admin',
      action: 'CREATE_SCHEME',
      entityType: 'scheme',
      entityId: newScheme.id,
      timestamp: new Date().toISOString(),
      metadata: { schemeCode: newScheme.code }
    });

    return res.status(201).json(newScheme);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// PUT /api/schemes/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Scheme.findOneAndUpdate(
      { $or: [{ id }, { code: id }] },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: 'usr-admin-1',
      actorName: 'MoTA Admin',
      actorRole: 'admin',
      action: 'UPDATE_SCHEME',
      entityType: 'scheme',
      entityId: id,
      timestamp: new Date().toISOString(),
      metadata: req.body
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
