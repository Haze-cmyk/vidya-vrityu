import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scheme } from '../../types';
import { ApplicationDraft, STEP_NAMES } from '../../lib/draftManager';
import {
  X,
  FileText,
  CheckCircle2,
  Calendar,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  DollarSign,
  Users
} from 'lucide-react';

interface SchemeDetailModalProps {
  scheme: Scheme | null;
  isOpen: boolean;
  onClose: () => void;
  draft?: ApplicationDraft | null;
  hasApplied?: boolean;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  isOpen,
  onClose,
  draft,
  hasApplied
}) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#c9b79c] overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#fcfaf7] border-b border-[#dfcdb1]">
          <div className="flex items-center space-x-2.5">
            <span className="bg-[#71816d] text-amber-300 font-extrabold text-xs px-3 py-1 rounded-md tracking-wider">
              {scheme.code}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-[#f1e0c5] px-2.5 py-1 rounded-md">
              {scheme.category}
            </span>
            <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Window Active
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800">
          
          {/* Title & Tagline */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {scheme.name}
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {scheme.description ||
                'Ministry of Tribal Affairs central sector scheme providing direct financial assistance to Scheduled Tribe scholars.'}
            </p>
          </div>

          {/* Draft in Progress Notification if applicable */}
          {draft && !hasApplied && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                <Clock className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 uppercase tracking-wide text-[11px]">
                    Draft In Progress
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    Saved at Step {draft.currentStep} of 7
                  </span>
                </div>
                <p className="mt-0.5 text-amber-800">
                  You started this application earlier ({STEP_NAMES[draft.currentStep] || 'In Progress'}). You can continue without losing your entered data.
                </p>
              </div>
            </div>
          )}

          {/* Key Scheme Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#f1e0c5] border border-[#dfcdb1]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Financial Aid
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1 flex items-center">
                <Award className="w-4 h-4 text-orange-600 mr-1 shrink-0" />
                <span>{scheme.amount}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f1e0c5] border border-[#dfcdb1]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Annual Slots
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1 flex items-center">
                <Users className="w-4 h-4 text-[#71816d] mr-1 shrink-0" />
                <span>{scheme.totalSlots} National Slots</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f1e0c5] border border-[#dfcdb1]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Selection Process
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1 capitalize">
                {scheme.selectionCriteria} Based
              </p>
            </div>
          </div>

          {/* Application Window */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-semibold">Application Window:</span>
            </div>
            <span className="font-bold text-slate-900">
              {new Date(scheme.window.start).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
              })}{' '}
              –{' '}
              {new Date(scheme.window.end).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Mandatory Documents Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-[#71816d]" />
              Mandatory Documents Checklist (PDF only):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheme.requiredDocs && scheme.requiredDocs.length > 0 ? (
                scheme.requiredDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 p-2.5 rounded-lg bg-[#fcfaf7] border border-[#dfcdb1] text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{doc}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Standard ST Caste Certificate and Income Certificate.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#fcfaf7] border-t border-[#dfcdb1] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          {hasApplied ? (
            <button
              disabled
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed shadow-xs"
            >
              <span>Already Applied</span>
            </button>
          ) : draft ? (
            <Link
              to={`/app/apply/${scheme.id}`}
              onClick={onClose}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Clock className="w-4 h-4 mr-1.5 animate-pulse" />
              <span>Continue Where Left Off (Step {draft.currentStep} of 7)</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          ) : (
            <Link
              to={`/app/apply/${scheme.id}`}
              onClick={onClose}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
