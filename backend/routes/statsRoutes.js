import express from 'express';
import { Application } from '../models/Application.js';

const router = express.Router();

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const allApps = await Application.find().lean();

    const totalApplications = allApps.length;
    const pendingVerification = allApps.filter(
      (a) => a.status === 'submitted' || a.status === 'under_verification'
    ).length;
    const verified = allApps.filter((a) => a.status === 'verified').length;
    const scrutinized = allApps.filter((a) => a.status === 'scrutinized').length;
    const selected = allApps.filter((a) => a.status === 'selected').length;
    const rejected = allApps.filter((a) => a.status === 'rejected').length;
    const deficient = allApps.filter((a) => a.status === 'query_raised').length;
    const disbursed = allApps.filter((a) => a.status === 'disbursed').length;

    // Applications grouped by Date
    const dateMap = {};
    allApps.forEach((a) => {
      const dateStr = a.submittedAt ? a.submittedAt.split('T')[0] : '2026-09-01';
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    });
    const applicationsByDate = Object.entries(dateMap).map(([date, count]) => ({ date, count }));

    // Scheme split
    const schemeMap = {};
    allApps.forEach((a) => {
      const code = a.schemeCode || 'NFST';
      schemeMap[code] = (schemeMap[code] || 0) + 1;
    });
    const schemeColors = {
      NFST: '#71816d',
      NOS: '#c9b79c',
      TCES: '#2A9D8F',
      OTHER: '#6F42A0'
    };
    const schemeSplit = Object.entries(schemeMap).map(([name, value]) => ({
      name,
      value,
      color: schemeColors[name] || '#71816d'
    }));

    // State split
    const stateMap = {};
    allApps.forEach((a) => {
      const state = a.address?.state || 'Other';
      stateMap[state] = (stateMap[state] || 0) + 1;
    });
    const stateSplit = Object.entries(stateMap).map(([state, count]) => ({ state, count }));

    // Funnel
    const funnelData = [
      { stage: 'Submitted', count: totalApplications, percentage: 100 },
      {
        stage: 'Verified',
        count: verified + scrutinized + selected + disbursed,
        percentage: totalApplications ? Math.round(((verified + scrutinized + selected + disbursed) / totalApplications) * 100) : 0
      },
      {
        stage: 'Scrutinized',
        count: scrutinized + selected + disbursed,
        percentage: totalApplications ? Math.round(((scrutinized + selected + disbursed) / totalApplications) * 100) : 0
      },
      {
        stage: 'Selected',
        count: selected + disbursed,
        percentage: totalApplications ? Math.round(((selected + disbursed) / totalApplications) * 100) : 0
      },
      {
        stage: 'Disbursed',
        count: disbursed,
        percentage: totalApplications ? Math.round((disbursed / totalApplications) * 100) : 0
      }
    ];

    // Deficiency reasons breakdown
    const defMap = {};
    allApps.forEach((a) => {
      if (a.deficiency?.reasons) {
        a.deficiency.reasons.forEach((r) => {
          defMap[r] = (defMap[r] || 0) + 1;
        });
      }
    });
    const deficiencyBreakdown = Object.entries(defMap).map(([reason, count]) => ({ reason, count }));

    // Anomalies
    const anomalies = [];
    allApps.forEach((a) => {
      if (a.anomalyFlags && a.anomalyFlags.length > 0) {
        a.anomalyFlags.forEach((reason) => {
          anomalies.push({
            id: a.id,
            applicantName: a.applicantName,
            schemeCode: a.schemeCode,
            reason,
            severity: 'High'
          });
        });
      }
    });

    return res.json({
      totalApplications,
      pendingVerification,
      verified,
      scrutinized,
      selected,
      rejected,
      deficient,
      disbursed,
      totalFundsDisbursed: disbursed * 0.42,
      applicationsByDate,
      schemeSplit,
      stateSplit,
      funnelData,
      deficiencyBreakdown,
      anomalies
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
