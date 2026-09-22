import React, { useState, useEffect } from 'react';
import { mockApi } from '../../lib/mockApi';
import { Scheme, EligibilityRule } from '../../types';
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  AlignLeft,
  FolderPlus,
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Standard recommended MoTA verification documents
const STANDARD_DOC_PRESETS = [
  { name: 'ST Caste Certificate', desc: 'Mandatory tribe certificate issued by Tehsildar / SDO' },
  { name: 'Income Certificate', desc: 'Current financial year certificate from Revenue Authority' },
  { name: 'Qualifying Examination Marksheet', desc: 'Previous academic degree grade card / marksheet' },
  { name: 'Institute Admission / Bonafide Letter', desc: 'Enrolled university / institute verification letter' },
  { name: 'Domicile / Resident Certificate', desc: 'State domicile / residence proof of candidate' },
  { name: 'Aadhaar Card / Identity Proof', desc: 'Government photo identity proof' },
  { name: 'Bank Passbook / DBT Cancelled Cheque', desc: 'PFMS direct benefit transfer bank proof' },
  { name: 'Ph.D. / Research Synopsis Letter', desc: 'Approved research synopsis or supervisor letter' },
  { name: 'Disability Certificate (PwD)', desc: 'Valid medical disability certificate if applicable' }
];

export const SchemeConfigEnginePage: React.FC = () => {
  // Navigation tabs: short and concise
  const [activeTab, setActiveTab] = useState<'metadata' | 'description' | 'documents' | 'rules'>('metadata');

  // Scheme list for editing existing schemes
  const [existingSchemes, setExistingSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('new');
  const [saving, setSaving] = useState(false);

  // Mobile preview toggle
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Tab 1: Metadata & Financials
  const [schemeName, setSchemeName] = useState('National Fellowship for Tribal Excellence');
  const [schemeCode, setSchemeCode] = useState('NFTE-2026');
  const [category, setCategory] = useState('Higher Fellowship');
  const [amount, setAmount] = useState('₹45,000 / month + HRA');
  const [totalSlots, setTotalSlots] = useState(500);
  const [selectionCriteria, setSelectionCriteria] = useState<'merit' | 'need' | 'hybrid'>('merit');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  // Tab 2: Scheme Description & Guidelines (Requested Description Tab)
  const [description, setDescription] = useState(
    'Special national fellowship for Scheduled Tribe (ST) scholars pursuing full-time M.Phil and Ph.D. degrees in premier scientific, technological, and social science research institutes across India.'
  );
  const [shortSummary, setShortSummary] = useState(
    'Prestigious financial grant and monthly stipend for high-achieving ST doctoral researchers.'
  );
  const [objectives, setObjectives] = useState(
    '• Monthly fellowship grant + annual contingency allowance\n• Institutional support in premier IITs, NITs, and Central Universities'
  );
  const [applicantGuidelines, setApplicantGuidelines] = useState(
    '1. Upload clear, legible PDF copies of all required certificates.\n2. Ensure applicant name on certificates matches the registered profile name.'
  );

  // Tab 3: Required Documents (Requested Document Chooser)
  const [requiredDocs, setRequiredDocs] = useState<string[]>([
    'ST Caste Certificate',
    'Income Certificate',
    'Qualifying Examination Marksheet',
    'Institute Admission / Bonafide Letter'
  ]);
  const [customDocName, setCustomDocName] = useState('');

  // Tab 4: Dynamic Eligibility Rules Engine
  const [rules, setRules] = useState<EligibilityRule[]>([
    { id: '1', field: 'Category', operator: 'eq', value: 'ST' },
    { id: '2', field: 'Annual Income', operator: 'lt', value: 600000 },
    { id: '3', field: 'Minimum Marks', operator: 'gt', value: 60 }
  ]);

  // Load existing schemes on mount
  useEffect(() => {
    mockApi.getSchemes().then((data) => {
      if (data && data.length > 0) {
        setExistingSchemes(data);
      }
    }).catch((err) => console.warn('Could not load existing schemes:', err));
  }, []);

  // Switch between schemes to edit or create new
  const handleSelectScheme = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    if (schemeId === 'new') {
      setSchemeName('');
      setSchemeCode(`SCHEME-${Date.now().toString().slice(-4)}`);
      setCategory('Scholarship');
      setAmount('₹50,000 / year');
      setTotalSlots(500);
      setSelectionCriteria('merit');
      setDescription('');
      setShortSummary('');
      setObjectives('');
      setApplicantGuidelines('');
      setRequiredDocs(['ST Caste Certificate', 'Income Certificate']);
      setRules([{ id: '1', field: 'Category', operator: 'eq', value: 'ST' }]);
      return;
    }

    const found = existingSchemes.find((s) => s.id === schemeId || s.code === schemeId);
    if (found) {
      setSchemeName(found.name || '');
      setSchemeCode(found.code || '');
      setCategory(found.category || 'Scholarship');
      setAmount(found.amount || '');
      setTotalSlots(found.totalSlots || 500);
      setSelectionCriteria(found.selectionCriteria || 'merit');
      setDescription(found.description || '');
      setStartDate(found.window?.start || '2026-09-01');
      setEndDate(found.window?.end || '2026-12-31');
      if (found.requiredDocs && found.requiredDocs.length > 0) {
        setRequiredDocs(found.requiredDocs);
      }
      if (found.eligibility && found.eligibility.length > 0) {
        setRules(found.eligibility);
      }
      toast.info(`Loaded scheme: ${found.name}`);
    }
  };

  // Toggle standard preset document
  const handleTogglePreset = (docName: string) => {
    if (requiredDocs.includes(docName)) {
      setRequiredDocs((prev) => prev.filter((d) => d !== docName));
      toast.info(`Removed "${docName}" from required documents`);
    } else {
      setRequiredDocs((prev) => [...prev, docName]);
      toast.success(`Added "${docName}" to required documents`);
    }
  };

  // Add custom document
  const handleAddCustomDoc = () => {
    const trimmed = customDocName.trim();
    if (!trimmed) {
      toast.error('Please enter a document name');
      return;
    }
    if (requiredDocs.includes(trimmed)) {
      toast.error('This document is already in the list');
      return;
    }
    setRequiredDocs((prev) => [...prev, trimmed]);
    setCustomDocName('');
    toast.success(`Added custom document: "${trimmed}"`);
  };

  // Remove document from list
  const handleRemoveDoc = (docName: string) => {
    setRequiredDocs((prev) => prev.filter((d) => d !== docName));
    toast.info(`Removed "${docName}"`);
  };

  // Dynamic Rules handlers
  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      { id: Date.now().toString(), field: 'Qualification', operator: 'eq', value: 'Post Graduate' }
    ]);
  };

  const handleRemoveRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Save or update scheme
  const handleSaveScheme = async () => {
    if (!schemeName.trim()) {
      toast.error('Scheme Name is required');
      setActiveTab('metadata');
      return;
    }
    if (!schemeCode.trim()) {
      toast.error('Scheme Code is required');
      setActiveTab('metadata');
      return;
    }
    if (requiredDocs.length === 0) {
      toast.error('Please choose at least 1 required document');
      setActiveTab('documents');
      return;
    }

    setSaving(true);
    const schemeData: Partial<Scheme> = {
      code: schemeCode.trim().toUpperCase(),
      name: schemeName.trim(),
      category,
      description: description.trim(),
      amount,
      totalSlots,
      eligibility: rules,
      requiredDocs,
      selectionCriteria,
      window: { start: startDate, end: endDate },
      stages: ['Submitted', 'Verified', 'Selected']
    };

    try {
      if (selectedSchemeId && selectedSchemeId !== 'new') {
        await mockApi.updateScheme(selectedSchemeId, schemeData);
        toast.success(`Scheme "${schemeCode}" updated successfully!`);
      } else {
        const created = await mockApi.createScheme(schemeData);
        toast.success(`New Scheme "${schemeCode}" Configured & Published Live!`);
        if (created) {
          setExistingSchemes((prev) => [created, ...prev]);
          setSelectedSchemeId(created.id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save scheme configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-0">
      {/* Top Header Card - Mobile Optimized */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b79c] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">MoTA Administration</span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {selectedSchemeId === 'new' ? 'Create New Scheme' : `Edit Scheme: ${schemeCode}`}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            Configure scheme metadata, write applicant descriptions, and choose mandatory documents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Scheme Switcher */}
          <select
            value={selectedSchemeId}
            onChange={(e) => handleSelectScheme(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#f1e0c5] border border-[#c9b79c] rounded-xl text-xs font-bold text-[#2c352a] focus:ring-2 focus:ring-[#71816d] outline-hidden cursor-pointer"
          >
            <option value="new">+ Create New Scheme</option>
            {existingSchemes.map((s) => (
              <option key={s.id || s.code} value={s.id || s.code}>
                Edit: {s.code} - {s.name.slice(0, 24)}...
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {/* Mobile Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobilePreview((prev) => !prev)}
              className="lg:hidden flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-[#f1e0c5] border border-[#c9b79c] text-slate-800 font-bold text-xs cursor-pointer"
            >
              {showMobilePreview ? <EyeOff className="w-3.5 h-3.5 mr-1.5 text-slate-700" /> : <Eye className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />}
              <span>{showMobilePreview ? 'Hide Preview' : 'Live Preview'}</span>
            </button>

            <button
              onClick={handleSaveScheme}
              disabled={saving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>{saving ? 'Publishing...' : selectedSchemeId === 'new' ? 'Publish Live' : 'Update Live'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Panel: Configuration Builder with Compact Horizontal Tabs */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b79c] shadow-xs space-y-4 sm:space-y-5">
          {/* Tab Navigation - Single Line Horizontal Scroll on Mobile, Neat Pill Row on Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 flex-nowrap border-b border-[#dfcdb1]">
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className={`inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'metadata'
                  ? 'bg-[#71816d] text-white shadow-xs'
                  : 'bg-[#f1e0c5] text-[#2c352a] hover:bg-[#e8d6ba]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 mr-1.5" />
              <span>1. Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'description'
                  ? 'bg-[#71816d] text-white shadow-xs'
                  : 'bg-[#f1e0c5] text-[#2c352a] hover:bg-[#e8d6ba]'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>2. Description</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'documents'
                  ? 'bg-[#71816d] text-white shadow-xs'
                  : 'bg-[#f1e0c5] text-[#2c352a] hover:bg-[#e8d6ba]'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5 mr-1.5" />
              <span>3. Documents</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'documents' ? 'bg-white/25 text-white' : 'bg-[#dfcdb1] text-[#2c352a]'
                }`}
              >
                {requiredDocs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'rules'
                  ? 'bg-[#71816d] text-white shadow-xs'
                  : 'bg-[#f1e0c5] text-[#2c352a] hover:bg-[#e8d6ba]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>4. Rules</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'rules' ? 'bg-white/25 text-white' : 'bg-[#dfcdb1] text-[#2c352a]'
                }`}
              >
                {rules.length}
              </span>
            </button>
          </div>

          {/* TAB 1: BASIC DETAILS & FINANCIALS */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center">
                  <Sliders className="w-4 h-4 mr-1.5 text-[#71816d]" />
                  Scheme Metadata & Financials
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Step 1 of 4</span>
              </div>

              {/* Direct Quick Action Card for Required Documents inside Basic Details */}
              <div className="p-3 bg-[#fbf8f3] rounded-xl border border-[#dfcdb1] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#f1e0c5] text-[#71816d] flex items-center justify-center shrink-0">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      Required Documents ({requiredDocs.length} Active)
                    </span>
                    <p className="text-[10px] text-slate-500 truncate">
                      {requiredDocs.slice(0, 3).join(', ')}
                      {requiredDocs.length > 3 ? ` +${requiredDocs.length - 3} more` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-[#71816d] hover:bg-[#8c9c88] text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Configure Documents ({requiredDocs.length})</span>
                </button>
              </div>

              {/* Metadata Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Scheme Name *</label>
                  <input
                    type="text"
                    value={schemeName}
                    placeholder="e.g. National Fellowship for Tribal Excellence"
                    onChange={(e) => setSchemeName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Scheme Code (Unique) *</label>
                  <input
                    type="text"
                    value={schemeCode}
                    placeholder="e.g. NFTE-2026"
                    onChange={(e) => setSchemeCode(e.target.value.toUpperCase())}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Scheme Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  >
                    <option value="Higher Fellowship">Higher Fellowship (M.Phil / Ph.D.)</option>
                    <option value="Pre-Matric Scholarship">Pre-Matric Scholarship (Class 9-10)</option>
                    <option value="Post-Matric Scholarship">Post-Matric Scholarship (Class 11+)</option>
                    <option value="Overseas Fellowship">National Overseas Scholarship (NOS)</option>
                    <option value="Top Class Education">Top Class Education for ST Students (TCES)</option>
                    <option value="Special Tribal Grant">Special Tribal Grant / Fellowship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Financial Assistance Amount</label>
                  <input
                    type="text"
                    value={amount}
                    placeholder="e.g. ₹45,000 / month + HRA"
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs font-bold focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Total National Slots</label>
                  <input
                    type="number"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Selection Mode</label>
                  <select
                    value={selectionCriteria}
                    onChange={(e) => setSelectionCriteria(e.target.value as 'merit' | 'need' | 'hybrid')}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  >
                    <option value="merit">Merit Based (Qualifying marks)</option>
                    <option value="need">Need Based (Annual family income)</option>
                    <option value="hybrid">Hybrid (Merit + Need ranking)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Application Window Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Application Window End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>
              </div>

              {/* Bottom Action Buttons for Tab 1 - Contains Direct Button for Required Documents */}
              <div className="pt-3 border-t border-[#dfcdb1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#f1e0c5] hover:bg-[#e8d6ba] text-[#2c352a] text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5 mr-1.5 text-[#71816d]" />
                  <span>Choose Required Documents ({requiredDocs.length}) →</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#71816d] hover:bg-[#8c9c88] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center transition-colors"
                >
                  <span>Continue to Description →</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEME DESCRIPTION & GUIDELINES (Requested Description Tab) */}
          {activeTab === 'description' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center">
                  <AlignLeft className="w-4 h-4 mr-1.5 text-[#71816d]" />
                  Scheme Description & Guidelines
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Step 2 of 4</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Short Summary */}
                <div>
                  <label className="block font-semibold text-slate-700">
                    Short Tagline / Summary (Shown on scheme cards)
                  </label>
                  <input
                    type="text"
                    value={shortSummary}
                    placeholder="Brief 1-line overview of the scholarship..."
                    onChange={(e) => setShortSummary(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block font-semibold text-slate-700">
                    Full Scheme Description *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    placeholder="Describe the scheme scope, target beneficiaries, eligibility highlights, and institutions..."
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs leading-relaxed focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                {/* Scheme Objectives */}
                <div>
                  <label className="block font-semibold text-slate-700">
                    Key Objectives & Benefits
                  </label>
                  <textarea
                    rows={2}
                    value={objectives}
                    placeholder="• Monthly stipend structure&#10;• Annual contingency allowance"
                    onChange={(e) => setObjectives(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>

                {/* Applicant Guidelines */}
                <div>
                  <label className="block font-semibold text-slate-700">
                    Important Instructions & Terms for Applicants
                  </label>
                  <textarea
                    rows={2}
                    value={applicantGuidelines}
                    placeholder="1. Documents must be in PDF format&#10;2. Must possess valid caste certificate"
                    onChange={(e) => setApplicantGuidelines(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#dfcdb1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('metadata')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#f1e0c5] hover:bg-[#e8d6ba] text-slate-800 text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#71816d] hover:bg-[#8c9c88] text-white text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  Continue to Documents ({requiredDocs.length}) →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REQUIRED DOCUMENTS (Requested Document Chooser) */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <FolderPlus className="w-4 h-4 mr-1.5 text-[#71816d]" />
                    Choose Required Verification Documents
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click standard MoTA presets or type custom documents for applicants to upload.
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Step 3 of 4</span>
              </div>

              {/* Standard Presets Selector */}
              <div className="p-3.5 rounded-xl bg-[#fbf8f3] border border-[#dfcdb1] space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  MoTA Standard Verification Presets (Click to toggle)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
                  {STANDARD_DOC_PRESETS.map((preset) => {
                    const isSelected = requiredDocs.includes(preset.name);
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleTogglePreset(preset.name)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#f1e0c5] border-[#71816d] text-slate-900 shadow-xs'
                            : 'bg-white border-[#c9b79c] text-slate-700 hover:bg-[#fbf8f3]'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{preset.name}</span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-1">{preset.desc}</p>
                        </div>
                        <div
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-[#71816d] text-white' : 'border border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Document Input */}
              <div className="p-3 rounded-xl bg-[#f1e0c5] border border-[#c9b79c] space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Add Custom Required Document</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customDocName}
                    placeholder="e.g. Research Synopsis / Hostel Fee Receipt"
                    onChange={(e) => setCustomDocName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomDoc();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm sm:text-xs focus:ring-2 focus:ring-[#71816d] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDoc}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-[#71816d] hover:bg-[#8c9c88] text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add Document</span>
                  </button>
                </div>
              </div>

              {/* Active Selected Documents List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Selected Documents ({requiredDocs.length})
                  </span>
                  <span className="text-[10px] text-slate-500">All uploaded in .pdf format</span>
                </div>

                {requiredDocs.length === 0 ? (
                  <div className="p-4 text-center rounded-xl border border-dashed border-rose-300 bg-rose-50 text-rose-700 text-xs font-semibold">
                    No documents selected. Please select at least 1 document above.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {requiredDocs.map((doc, idx) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#dfcdb1] shadow-xs text-xs"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#71816d] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900 truncate">{doc}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#dfcdb1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('metadata')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#f1e0c5] hover:bg-[#e8d6ba] text-slate-800 text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#71816d] hover:bg-[#8c9c88] text-white text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  Continue to Rules ({rules.length}) →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DYNAMIC ELIGIBILITY RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-[#71816d]" />
                    Dynamic Eligibility Rules Engine
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Define mathematical rules to filter and score submissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-[#e8d6ba] hover:bg-[#dfcdb1] text-slate-800 text-xs font-bold cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="space-y-2">
                {rules.map((rule, idx) => (
                  <div
                    key={rule.id || idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 p-2.5 bg-[#f1e0c5] border border-[#c9b79c] rounded-xl text-xs"
                  >
                    <input
                      type="text"
                      value={rule.field}
                      placeholder="Field (e.g. Category)"
                      onChange={(e) => {
                        const val = e.target.value;
                        setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, field: val } : r)));
                      }}
                      className="w-full sm:w-1/3 px-2 py-1.5 bg-white border border-slate-300 rounded-md outline-hidden text-xs"
                    />
                    <select
                      value={rule.operator}
                      onChange={(e) => {
                        const val = e.target.value as EligibilityRule['operator'];
                        setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, operator: val } : r)));
                      }}
                      className="w-full sm:w-1/4 px-2 py-1.5 bg-white border border-slate-300 rounded-md font-mono outline-hidden text-xs"
                    >
                      <option value="eq">EQUALS</option>
                      <option value="lt">LESS THAN</option>
                      <option value="gt">GREATER THAN</option>
                      <option value="in">IN LIST</option>
                    </select>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto flex-1">
                      <input
                        type="text"
                        value={String(rule.value)}
                        placeholder="Target Value"
                        onChange={(e) => {
                          const val = e.target.value;
                          setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, value: val } : r)));
                        }}
                        className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-md outline-hidden text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id!)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#dfcdb1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#f1e0c5] hover:bg-[#e8d6ba] text-slate-800 text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  ← Back to Documents
                </button>

                <button
                  type="button"
                  onClick={handleSaveScheme}
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Live Applicant Form Preview (Always visible on Desktop lg:block, Collapsible on Mobile) */}
        <div
          className={`lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b79c] shadow-xs space-y-3.5 ${
            showMobilePreview ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#dfcdb1] pb-2.5">
            <span className="text-xs font-bold text-[#2c352a] flex items-center">
              <Eye className="w-4 h-4 mr-1.5 text-[#71816d]" />
              Live Applicant Form Preview
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#f1e0c5] text-[#5a6857] border border-[#dfcdb1] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Real-time sync
            </span>
          </div>

          <div className="bg-[#fbf8f3] border border-[#dfcdb1] rounded-xl p-3.5 sm:p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="bg-[#71816d] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md tracking-wide shadow-xs">
                {schemeCode || 'SCHEME-CODE'}
              </span>
              <span className="bg-[#e8d6ba] text-[#2c352a] font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-[#c9b79c]">
                {category}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm sm:text-base text-[#2c352a]">{schemeName || 'Untitled Scheme'}</h4>
              {shortSummary && (
                <p className="text-[10px] sm:text-[11px] font-medium text-[#71816d] mt-0.5 italic">{shortSummary}</p>
              )}
              <p className="text-slate-600 text-[10px] sm:text-[11px] leading-relaxed mt-1 line-clamp-3">
                {description || 'No description provided yet.'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f1e0c5] border border-[#c9b79c] flex items-center justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#5a6857] block">Assistance</span>
                <span className="font-extrabold text-[#71816d] text-xs sm:text-sm">{amount}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-[#5a6857] block">Quota</span>
                <span className="font-bold text-slate-800 text-xs">{totalSlots} Slots</span>
              </div>
            </div>

            {/* Dynamic Eligibility Preview */}
            <div className="pt-2 border-t border-[#dfcdb1] space-y-1.5">
              <h5 className="font-bold text-[#2c352a] text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#71816d]" />
                Eligibility Criteria ({rules.length})
              </h5>
              <div className="space-y-1">
                {rules.map((rule, idx) => (
                  <div
                    key={rule.id || idx}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#dfcdb1] text-[10px] sm:text-[11px]"
                  >
                    <span className="font-semibold text-slate-700">{rule.field}</span>
                    <span className="font-bold text-[#5a6857] bg-[#f1e0c5] px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">
                      {rule.operator === 'eq'
                        ? 'Equals'
                        : rule.operator === 'lt'
                        ? 'Less than'
                        : rule.operator === 'gt'
                        ? 'Greater than'
                        : 'In'}{' '}
                      {String(rule.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Preview */}
            <div className="pt-2 border-t border-[#dfcdb1] space-y-1.5">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-[#2c352a] text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#71816d]" />
                  Required Documents ({requiredDocs.length})
                </h5>
                <span className="text-[9px] text-slate-500">.pdf only</span>
              </div>

              {requiredDocs.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No documents selected yet.</p>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {requiredDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-white border border-[#dfcdb1] flex items-center justify-between text-[10px]"
                    >
                      <span className="font-medium text-slate-800 flex items-center truncate mr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#71816d] mr-1.5 shrink-0"></span>
                        {doc}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold text-amber-800 bg-[#f1e0c5] px-1 py-0.5 rounded border border-[#dfcdb1] shrink-0">
                        Mandatory
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Applicant Button */}
            <div className="pt-1.5">
              <button
                type="button"
                disabled
                className="w-full py-2 px-3 rounded-xl bg-[#71816d]/20 text-[#5a6857] font-bold text-xs border border-[#71816d]/30 flex items-center justify-center cursor-not-allowed"
              >
                <span>Apply for Scheme (Applicant Portal View)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
