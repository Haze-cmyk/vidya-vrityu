import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { Application } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Calendar,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { draftManager, ApplicationDraft, STEP_NAMES } from '../../lib/draftManager';

export const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [drafts, setDrafts] = useState<ApplicationDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSwiped, setAutoSwiped] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const loadDrafts = () => {
    setDrafts(draftManager.getAllDrafts(user?.id));
  };

  useEffect(() => {
    loadDrafts();
    window.addEventListener('vidya_draft_updated', loadDrafts);
    return () => window.removeEventListener('vidya_draft_updated', loadDrafts);
  }, [user?.id]);

  useEffect(() => {
    mockApi.getApplications({ applicantId: user?.id || 'usr-student-1' }).then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, [user?.id]);

  // Automatic smooth swipe on mobile/tablet to reveal "View Details" and Status
  useEffect(() => {
    if (applications.length === 0 || loading) return;
    const el = tableContainerRef.current;
    if (!el) return;

    // Check if table overflows horizontally on the user's screen
    if (el.scrollWidth > el.clientWidth) {
      const timer = setTimeout(() => {
        el.scrollTo({
          left: el.scrollWidth - el.clientWidth,
          behavior: 'smooth'
        });
        setAutoSwiped(true);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [applications, loading, viewMode]);

  const scrollToSide = (direction: 'left' | 'right') => {
    const el = tableContainerRef.current;
    if (!el) return;
    el.scrollTo({
      left: direction === 'left' ? 0 : el.scrollWidth - el.clientWidth,
      behavior: 'smooth'
    });
    setAutoSwiped(direction === 'right');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#c9b79c] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Portal</span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">My Submitted Applications</h1>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* View Mode Switcher on Mobile/Tablet */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 mr-1" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              <span>Cards</span>
            </button>
          </div>

          <Link
            to="/app/schemes"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <span>Apply for Another Scheme</span>
          </Link>
        </div>
      </div>

      {/* Active Application Draft In Progress */}
      {drafts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-[#fdfaf5] border-2 border-amber-400/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0 shadow-2xs">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                    Draft In Progress
                  </span>
                  <span className="text-xs text-amber-800 font-semibold">
                    Step {drafts[0].currentStep} of 7 ({STEP_NAMES[drafts[0].currentStep] || 'Form'})
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mt-1">
                  {drafts[0].schemeName} ({drafts[0].schemeCode})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Unsubmitted application auto-saved. Click Continue Application to resume without losing any progress.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 sm:self-center shrink-0">
              <Link
                to={`/app/apply/${drafts[0].schemeId}`}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span>Continue Application</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mode 1: Mobile Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#c9b79c] text-xs text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#c9b79c] text-xs text-slate-500">
              No applications submitted yet.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/app/applications/${encodeURIComponent(app.id)}`)}
                className="bg-white rounded-2xl border border-[#c9b79c] p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer space-y-3.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#71816d] bg-[#f1e0c5] px-2.5 py-1 rounded-lg border border-[#dfcdb1]">
                    {app.id}
                  </span>
                  <StatusBadge status={app.status} size="sm" />
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-slate-900 leading-snug group-hover:text-[#71816d] transition-colors">
                    {app.schemeName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Scheme Code: {app.schemeCode}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-[#dfcdb1]">
                  <span className="flex items-center text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>

                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#71816d] group-hover:bg-[#5a6857] text-white font-bold text-xs shadow-xs transition-colors">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mode 2: Table with Auto-Swipe and Sticky View Details Column */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#c9b79c] shadow-xs overflow-hidden">
          {/* Quick Swipe Banner & Controls */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#fcfaf7] border-b border-[#dfcdb1] text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">
                {autoSwiped ? 'Auto-swiped to View Details' : 'Swipe left/right to view all columns'}
              </span>
              <span className="text-[11px] font-semibold text-slate-700 sm:hidden">
                Auto-swiped to View Details
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => scrollToSide('left')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] shadow-2xs flex items-center cursor-pointer transition-colors"
                title="Scroll to Application ID"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                <span>ID</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSide('right')}
                className="px-2.5 py-1 rounded-lg bg-[#71816d] hover:bg-[#5a6857] text-white font-bold text-[11px] shadow-2xs flex items-center cursor-pointer transition-colors"
                title="Scroll to View Details"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          <div ref={tableContainerRef} className="overflow-x-auto scroll-smooth">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-[#f1e0c5] border-b border-[#c9b79c] text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Application ID</th>
                  <th className="px-6 py-3.5">Scheme</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5">Current Status</th>
                  <th className="px-6 py-3.5 text-right sticky right-0 bg-[#f1e0c5] shadow-[-8px_0_10px_-3px_rgba(0,0,0,0.08)] z-10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/app/applications/${encodeURIComponent(app.id)}`)}
                      className="hover:bg-[#f1e0c5]/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-[#71816d] whitespace-nowrap">
                        {app.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-[240px]">
                        {app.schemeName} ({app.schemeCode})
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-[#f5e9d5] shadow-[-8px_0_10px_-3px_rgba(0,0,0,0.08)] z-10 whitespace-nowrap">
                        <Link
                          to={`/app/applications/${encodeURIComponent(app.id)}`}
                          className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#71816d] group-hover:bg-[#5a6857] text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
