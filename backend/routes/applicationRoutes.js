import express from 'express';
import { Application } from '../models/Application.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

// Helper to decode ID
const normalizeId = (id) => decodeURIComponent(id);

// GET /api/applications
router.get('/', async (req, res) => {
  try {
    const { schemeCode, status, state, applicantId, search } = req.query;
    const filter = {};

    if (schemeCode && schemeCode !== 'ALL') {
      filter.schemeCode = schemeCode;
    }
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (state && state !== 'ALL') {
      filter['address.state'] = state;
    }
    if (applicantId) {
      filter.applicantId = applicantId;
    }

    let apps = await Application.find(filter).sort({ submittedAt: -1 }).lean();

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.applicantName.toLowerCase().includes(q) ||
          a.personal?.tribeName?.toLowerCase().includes(q) ||
          a.address?.state?.toLowerCase().includes(q)
      );
    }

    return res.json(apps);
  } catch (err) {
    console.error('Error fetching applications:', err);
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/applications/merit-list
router.get('/merit-list', async (req, res) => {
  try {
    const schemeCode = req.query.schemeCode || 'NFST';
    const eligibleApps = await Application.find({
      schemeCode,
      status: { $in: ['verified', 'scrutinized', 'selected'] }
    }).lean();

    const candidates = eligibleApps.map((a, i) => {
      const academicScore = a.academic?.percentageOrCgpa || 75;
      const incomeVal = a.personal?.annualIncome || 200000;
      const incomeWeightage = Math.max(0, 20 - Math.floor(incomeVal / 30000));
      const researchScore = a.schemeCode === 'NFST' ? 15 + (i % 10) : 0;
      const totalScore = parseFloat((academicScore * 0.7 + incomeWeightage + researchScore).toFixed(2));

      return {
        applicationId: a.id,
        applicantName: a.applicantName,
        schemeCode: a.schemeCode,
        state: a.address?.state || 'Odisha',
        academicScore,
        incomeWeightage,
        researchProposalScore: researchScore,
        totalScore,
        rank: i + 1,
        status: i < 15 ? 'Selected' : i < 25 ? 'Waitlisted' : 'Under Review'
      };
    });

    // Sort descending by totalScore
    candidates.sort((a, b) => b.totalScore - a.totalScore);
    candidates.forEach((c, idx) => {
      c.rank = idx + 1;
    });

    return res.json(candidates);
  } catch (err) {
    console.error('Error generating merit list:', err);
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/applications/:id
router.get('/:id', async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const app = await Application.findOne({
      $or: [
        { id: cleanId },
        { id: cleanId.replace(/-/g, '/') },
        { id: cleanId.replace(/\//g, '-') }
      ]
    }).lean();

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }
    return res.json(app);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/applications (submit new application)
router.post('/', async (req, res) => {
  try {
    const appData = req.body;
    const schemeCode = appData.schemeCode || 'NFST';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const generatedId = `${schemeCode}/2026/00${randomNum}`;

    // Collect anomaly flags if documents had OCR mismatches or low confidence
    const anomalyFlags = [];
    if (appData.documents && Array.isArray(appData.documents)) {
      for (const doc of appData.documents) {
        if (doc.ocrConfidence && doc.ocrConfidence < 70) {
          anomalyFlags.push(`Low OCR Confidence (${doc.ocrConfidence}%) on ${doc.type}`);
        }
        if (doc.ocrFields && Array.isArray(doc.ocrFields)) {
          for (const f of doc.ocrFields) {
            if (f.isMismatch) {
              anomalyFlags.push(`Mismatch in ${f.field}: ${f.value} vs ${f.expectedValue}`);
            }
          }
        }
      }
    }

    const newApp = await Application.create({
      id: generatedId,
      applicantId: appData.applicantId || 'usr-student-1',
      applicantName: appData.personal?.fullName || 'Applicant',
      schemeId: appData.schemeId || 'scheme-nfst',
      schemeCode,
      schemeName: appData.schemeName || 'National Fellowship for Higher Education of ST Students',
      status: 'submitted',
      currentStage: 1,
      submittedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      personal: appData.personal || {},
      address: appData.address || {},
      academic: appData.academic || {},
      schemeSpecific: appData.schemeSpecific || {},
      bank: appData.bank || {},
      documents: appData.documents || [],
      ocrFields: appData.ocrFields || [],
      anomalyFlags
    });

    // Notify applicant
    await Notification.create({
      id: `notif-${Date.now()}`,
      userId: newApp.applicantId,
      title: 'Application Submitted Successfully',
      message: `Your application ${newApp.id} for ${newApp.schemeCode} has been submitted to MoTA for document verification.`,
      type: 'info',
      read: false,
      link: `/app/applications/${encodeURIComponent(newApp.id)}`,
      createdAt: new Date().toISOString()
    });

    // Audit log
    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: newApp.applicantId,
      actorName: newApp.applicantName,
      actorRole: 'applicant',
      action: 'SUBMIT_APPLICATION',
      entityType: 'application',
      entityId: newApp.id,
      timestamp: new Date().toISOString(),
      metadata: { schemeCode }
    });

    return res.status(201).json(newApp);
  } catch (err) {
    console.error('Submit application error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/applications/:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const officerName = req.body.officerName || 'Shri Rajesh Kumar';

    const app = await Application.findOne({
      $or: [
        { id: cleanId },
        { id: cleanId.replace(/-/g, '/') },
        { id: cleanId.replace(/\//g, '-') }
      ]
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = 'verified';
    app.currentStage = 3;
    app.verifiedBy = officerName;
    app.verifiedAt = new Date().toISOString();
    app.lastUpdatedAt = new Date().toISOString();
    await app.save();

    // Send notification
    await Notification.create({
      id: `notif-${Date.now()}`,
      userId: app.applicantId,
      title: 'Application Verified!',
      message: `Great news! Your application ${app.id} has passed document verification by MoTA.`,
      type: 'success',
      read: false,
      link: `/app/applications/${encodeURIComponent(app.id)}`,
      createdAt: new Date().toISOString()
    });

    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: 'usr-officer-1',
      actorName: officerName,
      actorRole: 'officer',
      action: 'VERIFY_APPLICATION',
      entityType: 'application',
      entityId: app.id,
      timestamp: new Date().toISOString(),
      metadata: { verifiedBy: officerName }
    });

    return res.json(app);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/applications/:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const { reason, officerName = 'Shri Rajesh Kumar' } = req.body;

    const app = await Application.findOne({
      $or: [
        { id: cleanId },
        { id: cleanId.replace(/-/g, '/') },
        { id: cleanId.replace(/\//g, '-') }
      ]
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = 'rejected';
    app.remarks = reason || 'Documents did not meet criteria';
    app.lastUpdatedAt = new Date().toISOString();
    await app.save();

    await Notification.create({
      id: `notif-${Date.now()}`,
      userId: app.applicantId,
      title: 'Application Status Update',
      message: `Your application ${app.id} was rejected: ${app.remarks}`,
      type: 'error',
      read: false,
      link: `/app/applications/${encodeURIComponent(app.id)}`,
      createdAt: new Date().toISOString()
    });

    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: 'usr-officer-1',
      actorName: officerName,
      actorRole: 'officer',
      action: 'REJECT_APPLICATION',
      entityType: 'application',
      entityId: app.id,
      timestamp: new Date().toISOString(),
      metadata: { reason }
    });

    return res.json(app);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/applications/:id/raise-deficiency
router.post('/:id/raise-deficiency', async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const { reasons, note, officerName = 'Shri Rajesh Kumar' } = req.body;

    const app = await Application.findOne({
      $or: [
        { id: cleanId },
        { id: cleanId.replace(/-/g, '/') },
        { id: cleanId.replace(/\//g, '-') }
      ]
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const currentRound = (app.deficiency?.round || 0) + 1;
    app.status = 'query_raised';
    app.deficiency = {
      raisedAt: new Date().toISOString(),
      raisedBy: officerName,
      reasons: reasons || ['Document mismatch'],
      note: note || '',
      round: currentRound
    };
    app.lastUpdatedAt = new Date().toISOString();
    await app.save();

    await Notification.create({
      id: `notif-${Date.now()}`,
      userId: app.applicantId,
      title: 'Action Required: Deficiency Raised',
      message: `Verification Officer raised queries on ${app.id}. Please check deficient documents and resubmit.`,
      type: 'warning',
      read: false,
      link: `/app/applications/${encodeURIComponent(app.id)}`,
      createdAt: new Date().toISOString()
    });

    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: 'usr-officer-1',
      actorName: officerName,
      actorRole: 'officer',
      action: 'RAISE_DEFICIENCY',
      entityType: 'application',
      entityId: app.id,
      timestamp: new Date().toISOString(),
      metadata: { reasons, note, round: currentRound }
    });

    return res.json(app);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/applications/:id/resubmit
router.post('/:id/resubmit', async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const { revisedDocs } = req.body;

    const app = await Application.findOne({
      $or: [
        { id: cleanId },
        { id: cleanId.replace(/-/g, '/') },
        { id: cleanId.replace(/\//g, '-') }
      ]
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = 'under_verification';
    app.lastUpdatedAt = new Date().toISOString();

    if (app.deficiency) {
      app.deficiency.resolvedAt = new Date().toISOString();
      if (!app.deficiencyHistory) app.deficiencyHistory = [];
      app.deficiencyHistory.push(app.deficiency);
    }

    if (revisedDocs && Array.isArray(revisedDocs)) {
      const docMap = new Map(app.documents.map((d) => [d.type, d]));
      revisedDocs.forEach((doc) => {
        docMap.set(doc.type, doc);
      });
      app.documents = Array.from(docMap.values());
    }

    await app.save();

    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: app.applicantId,
      actorName: app.applicantName,
      actorRole: 'applicant',
      action: 'RESUBMIT_DEFICIENCY',
      entityType: 'application',
      entityId: app.id,
      timestamp: new Date().toISOString(),
      metadata: { count: revisedDocs?.length || 0 }
    });

    return res.json(app);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// PUT /api/applications/:id (Update entire or partial application)
router.put('/:id', async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const app = await Application.findOne({
      $or: [
        { id: cleanId },
        { id: cleanId.replace(/-/g, '/') },
        { id: cleanId.replace(/\//g, '-') }
      ]
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { personal, address, academic, schemeSpecific, bank, documents, status, applicantName } = req.body;

    if (personal) {
      app.personal = { ...app.personal.toObject(), ...personal };
      if (personal.fullName) {
        app.applicantName = personal.fullName;
      }
    }
    if (address) {
      app.address = { ...app.address.toObject(), ...address };
    }
    if (academic) {
      app.academic = { ...app.academic.toObject(), ...academic };
    }
    if (schemeSpecific) {
      app.schemeSpecific = { ...app.schemeSpecific, ...schemeSpecific };
    }
    if (bank) {
      app.bank = { ...app.bank.toObject(), ...bank };
    }
    if (documents && Array.isArray(documents)) {
      app.documents = documents;
    }
    if (applicantName) {
      app.applicantName = applicantName;
    }

    if (status) {
      app.status = status;
    } else if (app.status === 'draft') {
      app.status = 'submitted';
    }

    app.lastUpdatedAt = new Date().toISOString();
    await app.save();

    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: app.applicantId,
      actorName: app.applicantName,
      actorRole: 'applicant',
      action: 'UPDATE_APPLICATION',
      entityType: 'application',
      entityId: app.id,
      timestamp: new Date().toISOString(),
      metadata: { status: app.status }
    });

    await Notification.create({
      id: `notif-${Date.now()}`,
      userId: app.applicantId,
      title: 'Application Updated & Locked',
      message: `Your corrections for application ${app.id} have been saved and locked for verification.`,
      type: 'info',
      read: false,
      link: `/app/applications/${encodeURIComponent(app.id)}`,
      createdAt: new Date().toISOString()
    });

    return res.json(app);
  } catch (err) {
    console.error('Update application error:', err);
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/applications/:id/unlock (Unlock application for editing)
router.post('/:id/unlock', async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const app = await Application.findOne({
      $or: [
        { id: cleanId },
        { id: cleanId.replace(/-/g, '/') },
        { id: cleanId.replace(/\//g, '-') }
      ]
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (app.status === 'disbursed') {
      return res.status(400).json({ message: 'Cannot unlock an application that has already been disbursed.' });
    }

    app.status = 'draft';
    app.lastUpdatedAt = new Date().toISOString();
    await app.save();

    await AuditLog.create({
      id: `log-${Date.now()}`,
      actorId: app.applicantId,
      actorName: app.applicantName,
      actorRole: 'applicant',
      action: 'UNLOCK_APPLICATION',
      entityType: 'application',
      entityId: app.id,
      timestamp: new Date().toISOString(),
      metadata: { unlockedAt: new Date().toISOString() }
    });

    await Notification.create({
      id: `notif-${Date.now()}`,
      userId: app.applicantId,
      title: 'Application Unlocked',
      message: `Application ${app.id} has been unlocked for corrections. Please review and lock once done.`,
      type: 'warning',
      read: false,
      link: `/app/applications/${encodeURIComponent(app.id)}`,
      createdAt: new Date().toISOString()
    });

    return res.json(app);
  } catch (err) {
    console.error('Unlock application error:', err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
